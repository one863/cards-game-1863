import { GameState } from '@/types';
import { GAME_RULES } from '@/core/rules/settings';
import { evaluateAttackActions } from './actions/AttackAction';
import { evaluatePlayActions } from './actions/PlayAction';
import { evaluateCardWeight } from './scorers/cardScorer'; 

export const getAIDecision = (gameState: GameState) => {
  try {
      const ai = gameState.opponent;
      const player = gameState.player;
      const handCount = ai.hand.length;
      const activeAttackers = ai.field.filter(c => !c.isFlipped && !c.hasActed);
      const isFieldFull = ai.field.length >= GAME_RULES.FIELD_SIZE;
      const flippedCount = ai.field.filter(c => c.isFlipped).length;

      // 0. CHECK RESSOURCES ÉPUISÉES
      if (handCount === 0 && activeAttackers.length === 0) {
          return { action: 'PASS', reason: "Ressources épuisées (Auto-Pass)" };
      }

      // 1. ANALYSE DU CONTEXTE ADVERSE (Stoppage Time / All-In)
      const isOpponentEmpty = player.hand.length === 0 && player.deck.length === 0;

      // 2. ÉVALUATION DES ACTIONS
      const attackAction = evaluateAttackActions(gameState);
      const playAction = evaluatePlayActions(gameState);

      // 3. PRIORITÉ MOMENTUM CRITIQUE (Point 3)
      // Si l'IA a 2 cartes retournées, elle DOIT privilégier une action qui permet de "nettoyer" le terrain.
      // Dans le jeu, le nettoyage se fait en gagnant un duel défensif ou en marquant un but.
      // Si une attaque a de bonnes chances de réussir (score > 80), on fonce pour marquer et tout nettoyer.
      if (flippedCount >= 2 && attackAction.score > 80) {
          return { action: 'ATTACK', id: attackAction.details?.id, reason: "Urgence Momentum : Tentative de but pour nettoyer le terrain" };
      }

      // 4. STOPPAGE TIME ALL-IN (Point 5)
      // Si l'adversaire est à sec, l'IA lance toutes ses forces dans la bataille.
      if (isOpponentEmpty && activeAttackers.length > 0) {
          // On attaque avec le meilleur attaquant disponible sans hésiter
          const bestAttacker = activeAttackers.reduce((prev, curr) => 
              evaluateCardWeight(prev, gameState) > evaluateCardWeight(curr, gameState) ? prev : curr
          );
          return { 
              action: 'ATTACK', 
              id: bestAttacker.instanceId, 
              reason: "Offensive finale : L'adversaire n'a plus de ressources" 
          };
      }

      // 5. PRUDENCE TACTIQUE (Point 4)
      // Si PlayAction a un score positif et que l'Attaque est risquée (score faible), on joue plutôt une carte.
      if (playAction.score > 0 && attackAction.score < 50) {
          return { action: 'PLAY', idx: playAction.details?.idx, reason: "Prudence tactique : On renforce le terrain plutôt qu'une attaque risquée" };
      }

      // 6. CHOIX DE LA MEILLEURE ACTION STANDARD
      if (attackAction.score >= playAction.score && attackAction.score > 0) {
          return { action: 'ATTACK', id: attackAction.details?.id, reason: attackAction.details?.reason };
      }
      
      if (playAction.score > attackAction.score && playAction.score > 0) {
          return { action: 'PLAY', idx: playAction.details?.idx, reason: playAction.details?.reason };
      }

      // 7. GESTION DU BLOCAGE
      if (!isFieldFull && handCount > 0) {
           return { action: 'PLAY', idx: playAction.details?.idx, reason: "Jeu forcé (Occupation terrain)" };
      }

      if (activeAttackers.length > 0) {
           const sacrifice = activeAttackers.reduce((prev, curr) => 
              evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr
           );
           return { action: 'ATTACK', id: sacrifice.instanceId, reason: "Rotation nécessaire" };
      }

      return { action: 'PASS', reason: "Fin de tour" };

  } catch (error) {
      console.error("Erreur Decision IA:", error);
      return { action: 'PASS', reason: "Error Fallback" };
  }
};
