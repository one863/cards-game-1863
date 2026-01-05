// src/core/ai/useAI.ts
import { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { getAIDecision } from './logic/aiDecision';
import { getKeywordPowerDetails } from '../rules/keywords';

const useAI = () => {
  const { gameState, handlePlayCard, handleAttack, handleBlock, handlePass, checkGameOver } = useGameStore();

  useEffect(() => {
    if (!gameState || gameState.turn !== 'opponent' || gameState.winner || gameState.goalEvent) return;

    const timer = setTimeout(() => {
      
      // --- CAS SPÉCIAL : MENEUR DE L'IA VIENT D'ARRIVER ---
      // L'IA doit décider si elle attaque immédiatement ou si elle passe.
      const lastLog = gameState.log[0];
      const isMeneurPhase = lastLog?.key === 'logs.meneur_trigger' && gameState.phase === 'MAIN' && !gameState.hasActionUsed;

      if (isMeneurPhase) {
          // On réutilise la logique de décision standard pour voir si une attaque est intéressante
          const decision = getAIDecision(gameState);
          
          if (decision.action === 'ATTACK') {
              handleAttack(decision.id!, 'opponent');
          } else {
              // Si l'IA ne veut pas attaquer (pas sûr, pas rentable), elle passe ce tour bonus
              handlePass('opponent');
          }
          return;
      }

      // 1. GESTION DU BLOCAGE
      if (gameState.phase === 'ATTACK_DECLARED') {
        const attackerId = gameState.attackerInstanceId;
        const attackerCard = gameState.player.field.find(c => c.instanceId === attackerId);
        
        const blockers = gameState.opponent.field.filter(c => !c.isFlipped);
        if (blockers.length > 0 && attackerCard) {
          const attDetails = getKeywordPowerDetails(attackerCard, 'attacker', gameState.player.field);
          // MOMENTUM REMOVED HERE 🔥
          const attTotalPower = attackerCard.vaep + attDetails.bonus;

          const sortedBlockers = [...blockers].sort((a, b) => {
              const bonusA = getKeywordPowerDetails(a, 'defender', gameState.opponent.field).bonus;
              const bonusB = getKeywordPowerDetails(b, 'defender', gameState.opponent.field).bonus;
              return (a.vaep + bonusA) - (b.vaep + bonusB);
          });

          const boostCards = gameState.opponent.hand
            .filter(c => c.effects.some(e => e.startsWith("BOOST")))
            .sort((a, b) => {
                const valA = a.effects.includes("BOOST2") ? 2 : 1;
                const valB = b.effects.includes("BOOST2") ? 2 : 1;
                return valB - valA;
            });

          let chosenBlocker = null;
          let chosenBoostId = null;

          const naturalWinner = sortedBlockers.find(b => {
              const defBonus = getKeywordPowerDetails(b, 'defender', gameState.opponent.field).bonus;
              return (b.vaep + defBonus) > attTotalPower;
          });

          if (naturalWinner) {
              chosenBlocker = naturalWinner;
          } else {
              if (boostCards.length > 0) {
                  for (const boost of boostCards) {
                      const boostVal = boost.effects.includes("BOOST2") ? 2 : 1;
                      const winnerWithBoost = sortedBlockers.find(b => {
                          const defBonus = getKeywordPowerDetails(b, 'defender', gameState.opponent.field).bonus;
                          return (b.vaep + defBonus + boostVal) > attTotalPower;
                      });
                      
                      if (winnerWithBoost) {
                          chosenBlocker = winnerWithBoost;
                          chosenBoostId = boost.instanceId!;
                          break; 
                      }
                  }
              }
              
              if (!chosenBlocker) {
                  chosenBlocker = sortedBlockers[0]; 
              }
          }

          handleBlock(chosenBlocker.instanceId!, chosenBoostId);
        } else {
            if (gameState.stoppageTimeAction) checkGameOver(true);
            else handlePass('opponent'); 
        }
        return;
      }

      // 2. GESTION DU TOUR
      if (gameState.phase === 'MAIN') {
        const decision = getAIDecision(gameState);
        
        if (decision.action === 'PLAY') {
            handlePlayCard(decision.idx!, 'opponent');
        } else if (decision.action === 'ATTACK') {
            handleAttack(decision.id!, 'opponent');
        } else {
            if (gameState.stoppageTimeAction) {
                checkGameOver(true);
            } else {
                handlePass('opponent');
            }
        }
      }
    }, 3000); // Increased delay to 3000ms as requested

    return () => clearTimeout(timer);
  }, [
    gameState?.turn, 
    gameState?.phase, 
    gameState?.attackerInstanceId, 
    gameState?.stoppageTimeAction, 
    gameState?.hasActionUsed,
    !!gameState?.goalEvent,
    gameState?.opponent.field.length,
    gameState?.opponent.hand.length,
    gameState?.player.field.length,
    gameState?.log // Ajout de log aux dépendances pour détecter le trigger Meneur
  ]);
};

export default useAI;
