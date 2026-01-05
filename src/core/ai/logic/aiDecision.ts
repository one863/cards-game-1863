import { GameState, Player } from '../../types';
import { GAME_RULES } from '../../rules/settings';
import { getKeywordPowerBonus } from '../../rules/keywords';

type Mentality = 'OFFENSIVE' | 'NEUTRAL' | 'DEFENSIVE';

/**
 * Logique de décision de l'IA (Phase MAIN)
 * L'IA joue toujours le rôle de l'OPPONENT.
 */
export const getAIDecision = (gameState: GameState) => {
  const ai = gameState.opponent;
  const player = gameState.player;
  
  // REGLE : On ne prend que les joueurs face visible et qui NE SONT PAS Gardiens (sauf urgence)
  const activeAttackers = ai.field.filter(c => !c.isFlipped && (c.pos !== 'GK' || ai.field.length === 1));
  const playerDefenders = player.field.filter(c => !c.isFlipped);

  const aiActiveCount = ai.field.filter(c => !c.isFlipped).length;
  const playerActiveCount = playerDefenders.length;

  /**
   * Calcule la puissance réelle d'un attaquant IA (VAEP + Bonus de poste/keywords)
   */
  const getTruePower = (card: Player, side: 'attacker' | 'defender', field: Player[]) => {
      return card.vaep + getKeywordPowerBonus(card, side, field);
  };

  // --- 0. DERNIÈRE CHANCE (Stoppage Time) ---
  if (gameState.stoppageTimeAction) {
      if (activeAttackers.length > 0) {
          const bestAttacker = activeAttackers.reduce((prev, curr) => 
            getTruePower(prev, 'attacker', ai.field) > getTruePower(curr, 'attacker', ai.field) ? prev : curr
          );
          return { action: 'ATTACK', id: bestAttacker.instanceId, reason: "[STOPPAGE] Dernière action décisive !" };
      }
      if (ai.hand.length > 0 && ai.field.length < GAME_RULES.FIELD_SIZE) {
          const bestCardIdx = ai.hand.reduce((bestIdx, current, idx, arr) => (current.vaep > arr[bestIdx].vaep) ? idx : bestIdx, 0);
          return { action: 'PLAY', idx: bestCardIdx, reason: "[STOPPAGE] Dernière carte" };
      }
      return { action: 'PASS', reason: "Fin du match" };
  }

  // --- DÉTERMINATION DE LA MENTALITÉ 🔥 ---
  let mentality: Mentality = 'NEUTRAL';
  if (ai.score < player.score) {
    mentality = 'OFFENSIVE'; 
  } else if (ai.score > player.score) {
    mentality = 'DEFENSIVE';
  }

  // 1. OPPORTUNITÉ LÉTALE (Priorité Absolue)
  if (activeAttackers.length > 0 && playerActiveCount === 0) {
      const attacker = activeAttackers.reduce((prev, current) => 
        getTruePower(prev, 'attacker', ai.field) > getTruePower(current, 'attacker', ai.field) ? prev : current
      );
      return { action: 'ATTACK', id: attacker.instanceId, reason: `[${mentality}] BUT OUVERT !` };
  }

  // 2. LOGIQUE SELON LA MENTALITÉ (Si on a le choix)
  if (mentality === 'DEFENSIVE') {
    // Si on peut encore jouer une carte pour sécuriser, on le fait avant d'attaquer
    if (ai.hand.length > 0 && aiActiveCount < 3 && ai.field.length < GAME_RULES.FIELD_SIZE) {
        return { action: 'PLAY', idx: 0, reason: "[DEFENSIVE] Sécurisation maximale du terrain" };
    }
  }

  // 3. ANALYSE DES DUELS AVEC BONUS 🔥 (Recherche d'une "Bonne" attaque)
  if (activeAttackers.length > 0 && playerActiveCount > 0) {
      const defenderPowers = playerDefenders.map(d => getTruePower(d, 'defender', player.field));
      const maxPlayerDefPower = Math.max(...defenderPowers);
      const minPlayerDefPower = Math.min(...defenderPowers);

      // A. Attaque DOMINANTE (Victoire quasi-assurée)
      const crushingAttacker = activeAttackers.find(att => {
          const power = getTruePower(att, 'attacker', ai.field);
          return power >= maxPlayerDefPower + 1;
      });

      if (crushingAttacker) {
          return { action: 'ATTACK', id: crushingAttacker.instanceId, reason: `[${mentality}] Duel dominant (Puissance ${getTruePower(crushingAttacker, 'attacker', ai.field)})` };
      }

      // B. Attaque OPPORTUNISTE (Victoire probable contre le plus faible)
      // On évite ça si on est en pure défense et qu'on a peu de joueurs
      if (mentality !== 'DEFENSIVE' || aiActiveCount >= 4) {
          const strongAttacker = activeAttackers.find(att => {
              const power = getTruePower(att, 'attacker', ai.field);
              return power > minPlayerDefPower;
          });

          if (strongAttacker) {
              return { action: 'ATTACK', id: strongAttacker.instanceId, reason: `[${mentality}] Duel favorable` };
          }
      }
  }

  // 4. DÉVELOPPEMENT (Si pas d'attaque sûre trouvée)
  // REGLE : Si on peut jouer une carte, on le fait plutôt que de passer ou de faire une attaque suicidaire
  if (ai.hand.length > 0 && ai.field.length < GAME_RULES.FIELD_SIZE) {
    const bestCardIdxInHand = ai.hand.reduce((best, curr, idx, arr) => curr.vaep > arr[best].vaep ? idx : best, 0);
    return { action: 'PLAY', idx: bestCardIdxInHand, reason: `[${mentality}] Renforcement terrain` };
  }

  // 5. CAS AGRESSIF (Optionnel)
  const aggressifAttacker = activeAttackers.find(att => att.effects?.includes("AGRESSIF"));
  if (aggressifAttacker && playerActiveCount > 0) {
      const maxPlayerDefPower = Math.max(...playerDefenders.map(d => getTruePower(d, 'defender', player.field)));
      if (maxPlayerDefPower >= 5) {
          return { action: 'ATTACK', id: aggressifAttacker.instanceId, reason: `[${mentality}] Sacrifice AGRESSIF contre menace ${maxPlayerDefPower}` };
      }
  }

  // 6. ACTION FORCÉE (OBLIGATION DE JOUER)
  // Si on arrive ici, c'est qu'on a pas trouvé d'attaque "sure" et qu'on ne peut pas jouer de carte (main vide ou terrain plein).
  // La règle est : "On ne peut pas passer". Donc on DOIT attaquer si possible.
  
  if (activeAttackers.length > 0) {
      // On prend l'attaquant le plus fort pour maximiser les chances (ou minimiser la casse)
      const bestForcedAttacker = activeAttackers.reduce((prev, curr) => 
        getTruePower(prev, 'attacker', ai.field) > getTruePower(curr, 'attacker', ai.field) ? prev : curr
      );
      return { action: 'ATTACK', id: bestForcedAttacker.instanceId, reason: "Action obligatoire (Terrain plein / Main vide)" };
  }

  // 7. VRAIMENT RIEN À FAIRE (Pas de carte, pas d'attaquant valide)
  // Cela ne devrait arriver qu'en cas de blocage total ou fin de ressources.
  return { action: 'PASS', reason: "Aucune action possible" };
};
