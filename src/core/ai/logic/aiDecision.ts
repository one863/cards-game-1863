import { GameState, Player } from '../../types';
import { GAME_RULES } from '../../rules/settings';
import { calculateTotalPowerBonus } from '../../engine/effectSystem';

/**
 * Évalue le poids tactique d'une carte.
 * Amélioration : Malus de "Flipped" augmenté pour encourager le remplacement Anti-Momentum.
 */
const evaluateCardWeight = (card: Player, gameState: GameState): number => {
    let weight = card.vaep;
    const aiField = gameState.opponent.field;
    const playerField = gameState.player.field;

    // 1. URGENCE DÉFENSIVE
    if (aiField.length <= 2) {
        if (card.pos === 'GK') weight += 4;
        if (card.pos === 'CB') weight += 2;
    }

    // 2. CONTRE-TACTIQUE : Réponse accrue aux ailiers (Passage de +3 à +5)
    const playerHasWingThreat = playerField.some(p => 
        !p.isFlipped && (p.pos === 'LW' || p.pos === 'RW')
    );
    if (playerHasWingThreat && ['LB', 'RB', 'LM', 'RM'].includes(card.pos)) {
        weight += 5; 
    }

    // 3. ÉTAT PHYSIQUE : Malus augmenté (Passage de -3 à -5) pour forcer la rotation
    if (card.isFlipped) weight -= 5;

    return weight;
};

export const getAIDecision = (gameState: GameState, isMeneur: boolean = false) => {
  try {
      const ai = gameState.opponent;
      const player = gameState.player;
      const aiField = ai.field;
      const hand = ai.hand;
      
      const aiActiveCount = aiField.filter(c => !c.isFlipped).length;
      const handCount = hand.length;
      const flippedCount = aiField.filter(c => c.isFlipped).length;

      // --- DÉTECTION URGENCE MOMENTUM ---
      // Si 2 cartes sont retournées, l'IA doit remplacer d'urgence pour éviter le 3-0.
      const isMomentumDanger = flippedCount >= 2;

      const isEconomyMode = handCount <= 1 && aiActiveCount >= 3 && ai.score >= player.score && !isMomentumDanger;

      if (handCount === 0 && aiActiveCount === 0) return { action: 'PASS', reason: "Ressources épuisées" };

      const playerVisibleCount = player.field.filter(c => !c.isFlipped).length;
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

      // 1. OPPORTUNITÉ LÉTALE
      if (activeAttackers.length > 0 && playerVisibleCount === 0) {
          const attacker = activeAttackers.reduce((prev, curr) => 
            getTruePower(prev, 'attacker', aiField) < getTruePower(curr, 'attacker', aiField) ? prev : curr
          );
          return { action: 'ATTACK', id: attacker.instanceId, reason: "BUT OUVERT !" };
      }

      // 2. LOGIQUE DE REMPLACEMENT TACTIQUE (SUBSTITUTION)
      // Amélioration : Si danger de Momentum, le seuil de gain (+3) tombe à (+1) pour sortir le joueur flipped.
      if (handCount > 0 && aiField.length > 0) {
          const weakestOnField = aiField.reduce((prev, curr) => evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr);
          const bestInHand = hand.reduce((prev, curr) => evaluateCardWeight(prev, gameState) > evaluateCardWeight(curr, gameState) ? prev : curr);

          const replacementThreshold = (isMomentumDanger && weakestOnField.isFlipped) ? 1 : 3;

          if (evaluateCardWeight(bestInHand, gameState) > evaluateCardWeight(weakestOnField, gameState) + replacementThreshold) {
              // Si le terrain est plein, on sacrifie via une attaque ou on attend le prochain tour ?
              // Ici, on simule le remplacement en libérant le slot par une attaque si nécessaire.
              if (isFieldFull) {
                const attacker = aiField.find(c => c.instanceId === weakestOnField.instanceId && !c.hasActed && !c.isFlipped);
                if (attacker) return { action: 'ATTACK', id: attacker.instanceId, reason: "Remplacement : Sacrifice pour libérer un slot" };
              } else if (weakestOnField.isFlipped) {
                 // Note: Votre système actuel ne permet peut-être pas de "vendre" une carte flipped sans attaquer.
                 // Si le moteur permet de jouer par dessus une carte flipped, on renvoie PLAY.
                 // Sinon, l'IA privilégiera de jouer une carte sur un slot vide si dispo.
              }
          }
      }

      // 3. ANALYSE DES ATTAQUES STRATÉGIQUES
      if (activeAttackers.length > 0 && playerVisibleCount > 0) {
          // A. CIBLAGE AGRESSIF
          const aggroCard = activeAttackers.find(att => att.effects?.includes("AGRESSIF"));
          if (aggroCard && (maxPlayerDefPower >= 9 || isMomentumDanger)) {
              return { action: 'ATTACK', id: aggroCard.instanceId, reason: "Neutralisation tactique" };
          }

          // B. Duel gagnant
          const winningAttacker = activeAttackers.find(att => {
              const power = getTruePower(att, 'attacker', aiField);
              return power > maxPlayerDefPower;
          });
          if (winningAttacker) return { action: 'ATTACK', id: winningAttacker.instanceId, reason: "Attaque sécurisée" };
      }

      // 4. JOUER UNE CARTE (RENFORCEMENT)
      if (handCount > 0 && !isFieldFull) {
          if (isEconomyMode && aiActiveCount >= 2) return { action: 'PASS', reason: "Économie de main active" };

          const bestIdx = hand.reduce((best, curr, idx, arr) => 
            evaluateCardWeight(curr, gameState) > evaluateCardWeight(arr[best], gameState) ? idx : best, 0);
          
          return { action: 'PLAY', idx: bestIdx, reason: isMomentumDanger ? "Alerte Momentum : Renfort immédiat" : "Renforcement tactique" };
      }

      return { action: 'PASS', reason: "Attente tactique" };

  } catch (error) {
      return { action: 'PASS', reason: "Fallback" };
  }
};