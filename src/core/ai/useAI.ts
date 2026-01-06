import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { getAIDecision } from './logic/aiDecision';
import { calculateTotalPowerBonus } from '../../core/engine/effectSystem';
import { GameState, Player } from '../../types';

const useAI = () => {
  const gameState = useGameStore(state => state.gameState);
  const handlePlayCard = useGameStore(state => state.handlePlayCard);
  const handleAttack = useGameStore(state => state.handleAttack);
  const handleBlock = useGameStore(state => state.handleBlock);
  const handlePass = useGameStore(state => state.handlePass);
  const addLog = useGameStore(state => state.addLog);
  const setWinner = useGameStore(state => state.setWinner);

  const lastActionTime = useRef<number>(0);
  const lastPhase = useRef<string>('');
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDefensivePhase = (state: GameState) => {
    const attackerId = state.attackerInstanceId;
    if (!attackerId) return;
    const attackerCard = state.player.field.find(c => c.instanceId === attackerId);
    const blockers = state.opponent.field.filter((c: Player) => !c.isFlipped);

    if (!blockers.length || !attackerCard) { 
        handlePass('opponent', true);
        return; 
    }

    const attPower = attackerCard.vaep + calculateTotalPowerBonus(state, attackerCard, 'player', 'attacker').bonus;
    const processedBlockers = blockers.map((b: Player) => ({
      card: b,
      power: b.vaep + calculateTotalPowerBonus(state, b, 'opponent', 'defender').bonus
    })).sort((a: any, b: any) => a.power - b.power);

    const winnerBlocker = processedBlockers.find((b: any) => b.power >= attPower);
    const finalBlocker = winnerBlocker || processedBlockers[0]; // Bloqueur le plus fort ou le premier si aucun ne gagne

    handleBlock(finalBlocker.card.instanceId!); 
  };

  const handleMainPhase = (state: GameState) => {
    const decision = getAIDecision(state);
    
    if (decision.action === 'PLAY') {
      const cardToPlay = state.opponent.hand[decision.idx];
      if (cardToPlay) {
        handlePlayCard(decision.idx, 'opponent');
      }
    } else if (decision.action === 'ATTACK') {
      if (decision.id) {
        handleAttack(decision.id, 'opponent');
      }
    } else if (decision.action === 'PASS') {
        handlePass('opponent');
    }
  };

  useEffect(() => {
    if (!gameState || gameState.winner || gameState.turn !== 'opponent') {
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
        stuckTimer.current = null;
        return;
    }

    const aiAction = () => {
      const now = Date.now();
      // Simple debounce pour éviter les actions multiples sur le même état/phase
      if (gameState.phase === lastPhase.current && now - lastActionTime.current < 1000) return;
      
      if (stuckTimer.current) clearTimeout(stuckTimer.current);

      lastActionTime.current = now;
      lastPhase.current = gameState.phase;

      if (gameState.phase === 'ATTACK_DECLARED') {
        handleDefensivePhase(gameState);
      } else if (gameState.phase === 'MAIN') {
        handleMainPhase(gameState);
      }
    };
    
    stuckTimer.current = setTimeout(aiAction, 1000); // Délai pour l'action de l'IA

    return () => {
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
    };
  }, [gameState?.turn, gameState?.phase, gameState?.attackerInstanceId, gameState?.player?.field.length, gameState?.opponent?.hand.length, gameState?.opponent?.field.length]);
};

export default useAI;
