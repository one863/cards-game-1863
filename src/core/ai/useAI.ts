// src/core/ai/useAI.ts
import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { getAIDecision } from './logic/aiDecision';
import { getKeywordPowerDetails } from '../rules/keywords';

const useAI = () => {
  const { gameState, handlePlayCard, handleAttack, handleBlock, handlePass, checkGameOver } = useGameStore();
  const lastActionTime = useRef<number>(0);
  const lastPhase = useRef<string>('');
  const lastMeneur = useRef<boolean>(false);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!gameState || gameState.turn !== 'opponent' || gameState.winner || gameState.goalEvent) {
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
        return;
    }

    const now = Date.now();
    
    // --- WATCHDOG ANTI-BLOCAGE ---
    // Si l'IA est bloquée plus de 3s dans le même état, on force le passage.
    if (stuckTimer.current) clearTimeout(stuckTimer.current);
    stuckTimer.current = setTimeout(() => {
        console.warn("⚠️ AI Watchdog triggered: Forcing PASS");
        handlePass('opponent');
    }, 4000); // 4 secondes de tolérance

    const timer = setTimeout(() => {
      // DÉBLOCAGE : On autorise si la phase change OU si le flag Meneur change
      const phaseChanged = gameState.phase !== lastPhase.current;
      const meneurChanged = !!gameState.meneurActive !== lastMeneur.current;
      
      if (!phaseChanged && !meneurChanged && now - lastActionTime.current < 800) return;

      lastActionTime.current = Date.now();
      lastPhase.current = gameState.phase;
      lastMeneur.current = !!gameState.meneurActive;
      
      // --- CAS SPÉCIAL : EFFET MENEUR ---
      if (gameState.meneurActive && gameState.phase === 'MAIN' && !gameState.hasActionUsed) {
          const decision = getAIDecision(gameState, true);
          if (decision.action === 'ATTACK') {
              handleAttack(decision.id!, 'opponent');
          } else {
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
                  const aggressiveBlocker = sortedBlockers.find(b => b.effects?.includes("AGRESSIF"));
                  chosenBlocker = aggressiveBlocker || sortedBlockers[0]; 
              }
          }
          handleBlock(chosenBlocker.instanceId!, chosenBoostId);
        } else {
            if (gameState.stoppageTimeAction) checkGameOver(gameState, true);
            else handlePass('opponent'); 
        }
        return;
      }

      // 2. TOURS NORMAUX
      if (gameState.phase === 'MAIN') {
        const decision = getAIDecision(gameState, false);
        if (decision.action === 'PLAY') {
            handlePlayCard(decision.idx!, 'opponent');
        } else if (decision.action === 'ATTACK') {
            handleAttack(decision.id!, 'opponent');
        } else {
            if (gameState.stoppageTimeAction) {
                checkGameOver(gameState, true);
            } else {
                handlePass('opponent');
            }
        }
      }
    }, 1000); 

    return () => {
        clearTimeout(timer);
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
    };
  }, [
    gameState?.turn, 
    gameState?.phase, 
    gameState?.attackerInstanceId, 
    gameState?.stoppageTimeAction, 
    gameState?.hasActionUsed,
    gameState?.meneurActive,
    !!gameState?.goalEvent,
    !!gameState?.winner
  ]);
};

export default useAI;
