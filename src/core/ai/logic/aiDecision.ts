import { GameState, Player } from '../../types';
import { GAME_RULES } from '../../rules/settings';
import { getKeywordPowerBonus } from '../../rules/keywords';

type Mentality = 'OFFENSIVE' | 'NEUTRAL' | 'DEFENSIVE';

/**
 * Logique de décision de l'IA (Phase MAIN)
 * L'IA joue toujours le rôle de l'OPPONENT.
 */
export const getAIDecision = (gameState: GameState, isMeneur: boolean = false) => {
  try {
      const ai = gameState.opponent;
      const player = gameState.player;
      
      // Sécurité : Si l'IA n'a plus de cartes ni de joueurs, elle doit passer (ou perdre)
      const aiActiveCount = ai.field.filter(c => !c.isFlipped).length;
      if (ai.hand.length === 0 && aiActiveCount === 0) {
          return { action: 'PASS', reason: "Plus de ressources" };
      }

      // Attaquants valides (non retournés, n'ayant pas agi, pas GK sauf si dernier joueur)
      const activeAttackers = ai.field.filter(c => !c.isFlipped && !c.hasActed && (c.pos !== 'GK' || ai.field.length === 1));
      const playerDefenders = player.field.filter(c => !c.isFlipped);
      const playerActiveCount = playerDefenders.length;

      const getTruePower = (card: Player, side: 'attacker' | 'defender', field: Player[]) => {
          return card.vaep + getKeywordPowerBonus(card, side, field);
      };

      // --- ANALYSE VISIBLE ---
      const defenderPowers = playerDefenders.map(d => getTruePower(d, 'defender', player.field));
      const maxPlayerDefPower = defenderPowers.length > 0 ? Math.max(...defenderPowers) : 0;
      const minPlayerDefPower = defenderPowers.length > 0 ? Math.min(...defenderPowers) : 0;

      // --- MENTALITÉ ---
      let mentality: Mentality = 'NEUTRAL';
      if (ai.score < player.score) mentality = 'OFFENSIVE'; 
      else if (ai.score > player.score) mentality = 'DEFENSIVE';

      // 1. OPPORTUNITÉ LÉTALE (BUT OUVERT)
      if (activeAttackers.length > 0 && playerActiveCount === 0) {
          const attacker = activeAttackers.reduce((prev, current) => 
            getTruePower(prev, 'attacker', ai.field) > getTruePower(current, 'attacker', ai.field) ? prev : current
          );
          return { action: 'ATTACK', id: attacker.instanceId, reason: `BUT OUVERT !` };
      }

      // 2. ATTAQUE TACTIQUE (Basée sur le visible uniquement 🔥)
      if (activeAttackers.length > 0 && playerActiveCount > 0) {
          // A. Attaque Gagnante (Force > Max Défense visible)
          const winningAttacker = activeAttackers.find(att => 
              getTruePower(att, 'attacker', ai.field) > maxPlayerDefPower
          );
          if (winningAttacker) {
              return { action: 'ATTACK', id: winningAttacker.instanceId, reason: "Duel gagnant (visible)" };
          }

          // B. Attaque sur le point faible (Force > Min Défense visible)
          const opportunisticAttacker = activeAttackers.find(att => 
              getTruePower(att, 'attacker', ai.field) > minPlayerDefPower
          );
          if (opportunisticAttacker && (mentality !== 'DEFENSIVE' || aiActiveCount >= 4)) {
              return { action: 'ATTACK', id: opportunisticAttacker.instanceId, reason: "Attaque sur point faible" };
          }
          
          // C. Cas AGRESSIF : Utiliser pour éliminer une grosse menace adverse
          const aggro = activeAttackers.find(att => att.effects?.includes("AGRESSIF"));
          if (aggro && maxPlayerDefPower >= 4) {
              return { action: 'ATTACK', id: aggro.instanceId, reason: "Sacrifice AGRESSIF" };
          }

          // D. Forcer l'égalité (Attaquant puissant vs Défenseur puissant)
          if (mentality === 'DEFENSIVE' || aiActiveCount > playerActiveCount) {
              const drawAttacker = activeAttackers.find(att => getTruePower(att, 'attacker', ai.field) === maxPlayerDefPower);
              if (drawAttacker && Math.random() > 0.5) {
                  return { action: 'ATTACK', id: drawAttacker.instanceId, reason: "Duel d'usure (égalité)" };
              }
          }
      }

      // 3. JOUER UNE CARTE (Si l'attaque est trop risquée ou impossible) 🔥
      // SAUF si c'est un tour Meneur (interdit de jouer)
      if (!isMeneur && ai.hand.length > 0 && ai.field.length < GAME_RULES.FIELD_SIZE) {
          const bestCardIdx = ai.hand.reduce((best, curr, idx, arr) => curr.vaep > arr[best].vaep ? idx : best, 0);
          return { action: 'PLAY', idx: bestCardIdx, reason: "Renforcement terrain" };
      }

      // 4. DERNIER RECOURS (Tour Meneur ou Stoppage Time)
      if (activeAttackers.length > 0) {
          if (isMeneur || gameState.stoppageTimeAction) {
              const bestForced = activeAttackers.reduce((prev, curr) => getTruePower(prev, 'attacker', ai.field) > getTruePower(curr, 'attacker', ai.field) ? prev : curr);
              return { action: 'ATTACK', id: bestForced.instanceId, reason: "Offensive forcée" };
          }
      }

      // 5. PASS (Vraiment si plus rien n'est possible)
      return { action: 'PASS', reason: "Fin de ressources" };

  } catch (error) {
      console.error("AI Decision Error:", error);
      return { action: 'PASS', reason: "Erreur IA (Fallback)" };
  }
};
