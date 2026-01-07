import { GameState } from '../../types';
import { GAME_RULES } from '../../rules/settings';
import { evaluateAttackActions } from './actions/AttackAction';
import { evaluatePlayActions } from './actions/PlayAction';
import { evaluateCardWeight } from './scorers/cardScorer'; 

export const getAIDecision = (gameState: GameState, isMeneur: boolean = false) => {
  try {
      const ai = gameState.opponent;
      const handCount = ai.hand.length;
      const activeCount = ai.field.filter(c => !c.isFlipped).length;

      // 0. CHECK RESSOURCES ÉPUISÉES (Seul cas légal de PASS)
      // On vérifie aussi si toutes les cartes sur le terrain ont déjà agi (hasActed)
      const canAttack = ai.field.some(c => !c.isFlipped && !c.hasActed);
      if (handCount === 0 && !canAttack) {
          return { action: 'PASS', reason: "Ressources épuisées (Auto-Pass)" };
      }

      // 1. ÉVALUATION DES ACTIONS
      const attackAction = evaluateAttackActions(gameState);
      const playAction = evaluatePlayActions(gameState);

      console.log(`AI Brain: Attack=${attackAction.score} (${attackAction.details?.reason}), Play=${playAction.score}`);

      // 2. CHOIX DE LA MEILLEURE ACTION
      // Si une action a un score positif, on la prend
      if (attackAction.score >= playAction.score && attackAction.score > 0) {
          return { action: 'ATTACK', id: attackAction.details?.id, reason: attackAction.details?.reason };
      }
      
      if (playAction.score > attackAction.score && playAction.score > 0) {
          return { action: 'PLAY', idx: playAction.details?.idx, reason: playAction.details?.reason };
      }

      // 3. GESTION DES CAS DE BLOCAGE (Scores négatifs)
      // Si on est là, c'est qu'aucune action n'est "bonne". Mais on DOIT agir.
      
      // A. Si on peut jouer une carte, on le fait (même si score bas)
      if (playAction.score > -1) {
           return { action: 'PLAY', idx: playAction.details?.idx, reason: "Jeu forcé (Moindre mal)" };
      }

      // B. Si on ne peut pas jouer (terrain plein ou main vide), on DOIT attaquer
      if (attackAction.score > -100) { // On accepte n'importe quelle attaque valide
           return { action: 'ATTACK', id: attackAction.details?.id, reason: "Attaque forcée (Interdiction de passer)" };
      }

      // C. Substitution (Dernier recours si Terrain Plein et Main non vide)
      const isFieldFull = ai.field.length >= GAME_RULES.FIELD_SIZE;
      if (isFieldFull && handCount > 0) {
          const activeAttackers = ai.field.filter(c => !c.isFlipped && !c.hasActed);
          if (activeAttackers.length > 0) {
              // On sacrifie le plus faible pour libérer un slot
              const weakest = activeAttackers.reduce((prev, curr) => evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr);
              return { action: 'ATTACK', id: weakest.instanceId, reason: "Substitution forcée" };
          }
      }

      // D. Si vraiment rien n'est possible (bug logique), on passe pour éviter le crash
      return { action: 'PASS', reason: "Fallback (Bug)" };

  } catch (error) {
      console.error("Erreur Decision IA:", error);
      return { action: 'PASS', reason: "Error Fallback" };
  }
};
