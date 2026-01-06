import { GameState, Player } from '../../types';
import { GAME_RULES } from '../../rules/settings';
import { calculateTotalPowerBonus } from '../../engine/effectSystem';

type Mentality = 'OFFENSIVE' | 'NEUTRAL' | 'DEFENSIVE';

/**
 * Évalue le poids tactique d'une carte en main ou sur le terrain.
 */
const evaluateCardWeight = (card: Player, gameState: GameState): number => {
    let weight = card.vaep;
    const aiField = gameState.opponent.field;
    const playerField = gameState.player.field;

    // 1. URGENCE DÉFENSIVE : Priorité aux GK/CB si la défense est fragile
    if (aiField.length <= 2) {
        if (card.pos === 'GK') weight += 4;
        if (card.pos === 'CB') weight += 2;
    }

    // 2. CONTRE-TACTIQUE : Réponse aux ailiers adverses
    const playerHasWingThreat = playerField.some(p => 
        !p.isFlipped && (p.pos === 'LW' || p.pos === 'RW')
    );
    if (playerHasWingThreat && ['LB', 'RB', 'LM', 'RM'].includes(card.pos)) {
        weight += 3;
    }

    // 3. ÉTAT PHYSIQUE : Malus pour les cartes déjà retournées (Flipped)
    if (card.isFlipped) weight -= 3;

    return weight;
};

/**
 * Logique de décision de l'IA (Phase MAIN)
 */
export const getAIDecision = (gameState: GameState, isMeneur: boolean = false) => {
  try {
      const ai = gameState.opponent;
      const player = gameState.player;
      const aiField = ai.field;
      const hand = ai.hand;
      
      const aiActiveCount = aiField.filter(c => !c.isFlipped).length;
      const handCount = hand.length;

      // --- GESTION ÉCONOME : Éviter de vider la main trop vite ---
      // L'IA économise si elle a peu de cartes et un terrain déjà solide.
      const isEconomyMode = handCount <= 1 && aiActiveCount >= 3 && ai.score >= player.score;

      if (handCount === 0 && aiActiveCount === 0) return { action: 'PASS', reason: "Ressources épuisées" };

      const playerVisibleCount = player.field.filter(c => !c.isFlipped).length;
      const flippedCount = aiField.filter(c => c.isFlipped).length;
      const isInDanger = flippedCount >= 2; //

      const activeAttackers = aiField.filter(c => {
          if (c.isFlipped || c.hasActed) return false;
          if (c.pos === 'GK') return (aiActiveCount === 1 || playerVisibleCount === 0);
          return true;
      });

      const getTruePower = (card: Player, side: 'attacker' | 'defender', field: Player[]) => {
          const ownerSide = field === player.field ? 'player' : 'opponent';
          return card.vaep + calculateTotalPowerBonus(gameState, card, ownerSide, side).bonus;
      };

      const defenderPowers = player.field.filter(c => !c.isFlipped).map(d => getTruePower(d, 'defender', player.field));
      const maxPlayerDefPower = defenderPowers.length > 0 ? Math.max(...defenderPowers) : 0;
      
      const isFieldFull = aiField.length >= GAME_RULES.FIELD_SIZE;

      // 1. OPPORTUNITÉ LÉTALE (BUT OUVERT)
      if (activeAttackers.length > 0 && playerVisibleCount === 0) {
          const attacker = activeAttackers.reduce((prev, curr) => 
            getTruePower(prev, 'attacker', aiField) < getTruePower(curr, 'attacker', aiField) ? prev : curr
          );
          return { action: 'ATTACK', id: attacker.instanceId, reason: "BUT OUVERT ! (Économie de star)" };
      }

      // 2. LOGIQUE DE REMPLACEMENT TACTIQUE (SUBSTITUTION)
      // Si le terrain est plein, l'IA regarde si une carte en main est BIEN meilleure qu'une sur le terrain.
      if (isFieldFull && handCount > 0 && activeAttackers.length > 0) {
          const weakestOnField = aiField.reduce((prev, curr) => evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr);
          const bestInHand = hand.reduce((prev, curr) => evaluateCardWeight(prev, gameState) > evaluateCardWeight(curr, gameState) ? prev : curr);

          // Si le gain de poids est significatif (+3), on sacrifie le faible pour faire de la place.
          if (evaluateCardWeight(bestInHand, gameState) > evaluateCardWeight(weakestOnField, gameState) + 3) {
              const attacker = aiField.find(c => c.instanceId === weakestOnField.instanceId && !c.hasActed && !c.isFlipped);
              if (attacker) return { action: 'ATTACK', id: attacker.instanceId, reason: "Remplacement : Sacrifice pour libérer un slot" };
          }
      }

      // 3. ANALYSE DES ATTAQUES STRATÉGIQUES
      if (activeAttackers.length > 0 && playerVisibleCount > 0 && !isInDanger) {
          
          // A. CIBLAGE AGRESSIF : Mission suicide contre les stars adverses (VAEP 9+)
          const aggroCard = activeAttackers.find(att => att.effects?.includes("AGRESSIF"));
          if (aggroCard && maxPlayerDefPower >= 9) {
              return { action: 'ATTACK', id: aggroCard.instanceId, reason: "Neutralisation : Élimination d'une star adverse" };
          }

          // B. Duel gagnant (Sûr)
          const winningAttacker = activeAttackers.find(att => {
              const power = getTruePower(att, 'attacker', aiField);
              const isEliteDef = ['GK', 'CB', 'CDM'].includes(att.pos) && att.vaep >= 8;
              return isEliteDef ? power > maxPlayerDefPower + 1 : power > maxPlayerDefPower;
          });
          if (winningAttacker) return { action: 'ATTACK', id: winningAttacker.instanceId, reason: "Attaque sécurisée" };
      }

      if (isMeneur) return { action: 'PASS', reason: "Action Meneur déclinée" };

      // 4. JOUER UNE CARTE (PONDÉRATION & ÉCONOMIE)
      if (handCount > 0 && !isFieldFull) {
          if (isEconomyMode && aiActiveCount >= 2) return { action: 'PASS', reason: "Économie de main active" };

          const bestIdx = hand.reduce((best, curr, idx, arr) => 
            evaluateCardWeight(curr, gameState) > evaluateCardWeight(arr[best], gameState) ? idx : best, 0);
          
          return { action: 'PLAY', idx: bestIdx, reason: "Renforcement tactique" };
      }

      // 5. SACRIFICE FORCÉ (TERRAIN PLEIN)
      if (activeAttackers.length > 0 && isFieldFull) {
          const weakling = activeAttackers.reduce((prev, curr) => curr.vaep < prev.vaep ? curr : prev);
          return { action: 'ATTACK', id: weakling.instanceId, reason: "Rotation forcée" };
      }

      return { action: 'PASS', reason: "Attente tactique" };

  } catch (error) {
      console.error("Erreur Decision IA:", error);
      return { action: 'PASS', reason: "Fallback" };
  }
};