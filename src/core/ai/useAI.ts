import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { getAIDecision } from './logic/aiDecision';
import { getTruePower } from './logic/scorers/powerScorer';
import { evaluateCardWeight } from './logic/scorers/cardScorer';
import { calculateTotalPowerBonus } from '@/core/engine/effectSystem';
import { GameState, Player } from '@/types';

const useAI = () => {
  const gameState = useGameStore(state => state.gameState);
  const handlePlayCard = useGameStore(state => state.handlePlayCard);
  const handleAttack = useGameStore(state => state.handleAttack);
  const handleBlock = useGameStore(state => state.handleBlock);
  const handlePass = useGameStore(state => state.handlePass);

  const lastActionTime = useRef<number>(0);
  const lastStateFingerprint = useRef<string>('');
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDefensivePhase = (state: GameState) => {
    const attackerId = state.attackerInstanceId;
    if (!attackerId) return;
    
    const attackerSideKey = state.turn === 'player' ? 'opponent' : 'player';
    const attackerSide = state[attackerSideKey];
    const attackerCard = attackerSide.field.find(c => c.instanceId === attackerId);
    
    const blockers = state.opponent.field.filter((c: Player) => !c.isFlipped);

    if (!blockers.length || !attackerCard) { 
        handlePass('opponent', true);
        return; 
    }

    const attPower = attackerCard.vaep + calculateTotalPowerBonus(state, attackerCard, attackerSideKey, 'attacker').bonus;
    const flippedCount = state.opponent.field.filter(c => c.isFlipped).length;

    // ÉVALUATION TACTIQUE DES BLOQUEURS
    const processedBlockers = blockers.map((b: Player) => {
      const power = getTruePower(state, b, 'defender', state.opponent.field);
      const weight = evaluateCardWeight(b, state);
      
      // SCORE DE PRIORITÉ : On veut maximiser la puissance tout en minimisant le sacrifice de cartes clés
      let priorityScore = 0;
      
      // 1. On cherche la victoire ou l'égalité
      if (power > attPower) priorityScore += 1000;
      else if (power === attPower) priorityScore += 500;
      
      // 2. Bonus si c'est un pur défenseur (CB/GK) : On veut qu'ils fassent leur job
      if (['CB', 'GK', 'LB', 'RB'].includes(b.pos)) priorityScore += 200;
      
      // 3. Malus si c'est une carte de grande valeur (Milieux/Attaquants) : On veut les préserver pour l'attaque
      if (['CAM', 'ST', 'LW', 'RW'].includes(b.pos)) priorityScore -= 300;

      return { card: b, power, weight, priorityScore };
    }).sort((a, b) => b.priorityScore - a.priorityScore || a.weight - b.weight);

    // On prend le bloqueur avec le meilleur score de priorité
    const bestBlocker = processedBlockers[0].card;
    handleBlock(bestBlocker.instanceId!); 
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
        handlePass('opponent', true);
    }
  };

  useEffect(() => {
    if (!gameState || gameState.winner || gameState.turn !== 'opponent' || gameState.goalEvent) {
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
        stuckTimer.current = null;
        return;
    }

    const fingerprint = JSON.stringify({
        phase: gameState.phase,
        handSize: gameState.opponent.hand.length,
        fieldSize: gameState.opponent.field.length,
        activeCount: gameState.opponent.field.filter(c => !c.isFlipped && !c.hasActed).length,
        attackerId: gameState.attackerInstanceId,
        score: `${gameState.player.score}-${gameState.opponent.score}`,
        turn: gameState.turn,
        goal: !!gameState.goalEvent
    });

    const aiAction = () => {
      const now = Date.now();
      const isNewState = fingerprint !== lastStateFingerprint.current;
      const isCooldownOver = now - lastActionTime.current > 1500;

      if (!isNewState && !isCooldownOver) return;
      
      if (stuckTimer.current) clearTimeout(stuckTimer.current);

      lastActionTime.current = now;
      lastStateFingerprint.current = fingerprint;

      if (gameState.phase === 'ATTACK_DECLARED') {
        handleDefensivePhase(gameState);
      } else if (gameState.phase === 'MAIN') {
        handleMainPhase(gameState);
      }
    };
    
    stuckTimer.current = setTimeout(aiAction, 2000); 

    return () => {
        if (stuckTimer.current) clearTimeout(stuckTimer.current);
    };
  }, [
      gameState?.turn, 
      gameState?.phase, 
      gameState?.attackerInstanceId, 
      gameState?.opponent?.hand.length, 
      gameState?.opponent?.field.length,
      gameState?.player?.score,
      gameState?.opponent?.score,
      !!gameState?.goalEvent 
  ]);
};

export default useAI;