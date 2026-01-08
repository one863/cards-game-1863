import { GameState } from '@/types';
import { GAME_RULES } from '@/core/rules/settings';
import { evaluateAttackActions } from './actions/AttackAction';
import { evaluatePlayActions } from './actions/PlayAction';
import { evaluateCardWeight } from './scorers/cardScorer'; 

export const getAIDecision = (gameState: GameState, isMeneur: boolean = false) => {
  try {
      const ai = gameState.opponent;
      const handCount = ai.hand.length;
      const activeAttackers = ai.field.filter(c => !c.isFlipped && !c.hasActed);
      const isFieldFull = ai.field.length >= GAME_RULES.FIELD_SIZE;

      // 0. CHECK RESSOURCES ÉPUISÉES (Seul cas légal de PASS)
      if (handCount === 0 && activeAttackers.length === 0) {
          return { action: 'PASS', reason: "Ressources épuisées (Auto-Pass)" };
      }

      // 1. ÉVALUATION DES ACTIONS
      const attackAction = evaluateAttackActions(gameState);
      const playAction = evaluatePlayActions(gameState);

      console.log(`AI Brain: Attack=${attackAction.score} (${attackAction.details?.reason}), Play=${playAction.score}`);

      // 2. CAS CRITIQUE : TERRAIN PLEIN + BESOIN DE JOUER
      // Si le terrain est plein et qu'on a une carte en main qui "veut" absolument être jouée (score élevé)
      // On force une attaque de sacrifice pour libérer un slot.
      if (isFieldFull && handCount > 0 && activeAttackers.length > 0) {
          // Si PlayAction a un score très élevé (ex: survie momentum ou réponse à un ST)
          // OU si aucune attaque n'est jugée "viable" par l'algorithme d'efficacité
          if (playAction.score > 100 || attackAction.score <= 0) {
              const weakest = activeAttackers.reduce((prev, curr) => 
                  evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr
              );
              return { 
                  action: 'ATTACK', 
                  id: weakest.instanceId, 
                  reason: "Substitution stratégique (Libération de slot pour défense/renfort)" 
              };
          }
      }

      // 3. CHOIX DE LA MEILLEURE ACTION STANDARD
      if (attackAction.score >= playAction.score && attackAction.score > 0) {
          return { action: 'ATTACK', id: attackAction.details?.id, reason: attackAction.details?.reason };
      }
      
      if (playAction.score > attackAction.score && playAction.score > 0) {
          return { action: 'PLAY', idx: playAction.details?.idx, reason: playAction.details?.reason };
      }

      // 4. GESTION DES CAS DE BLOCAGE (Interdiction de rester immobile si actions possibles)
      
      // A. Si on peut jouer (terrain non plein), on le fait.
      if (!isFieldFull && handCount > 0 && playAction.score > -100) {
           return { action: 'PLAY', idx: playAction.details?.idx, reason: "Jeu forcé (Occupation terrain)" };
      }

      // B. Si on doit attaquer (terrain plein ou main vide), on le fait même si risqué.
      if (activeAttackers.length > 0) {
           // On choisit celui qui a le moins de valeur pour limiter la casse
           const sacrifice = activeAttackers.reduce((prev, curr) => 
              evaluateCardWeight(prev, gameState) < evaluateCardWeight(curr, gameState) ? prev : curr
           );
           return { action: 'ATTACK', id: sacrifice.instanceId, reason: "Attaque forcée (Rotation nécessaire)" };
      }

      // D. Si vraiment rien n'est possible, on passe.
      return { action: 'PASS', reason: "Fin de tour (Aucune action valide restante)" };

  } catch (error) {
      console.error("Erreur Decision IA:", error);
      return { action: 'PASS', reason: "Error Fallback" };
  }
};
