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
    const attackerCard = state.player.field.find(c => c.instanceId === attackerId);
    const blockers = state.opponent.field.filter((c: Player) => !c.isFlipped);

    if (!blockers.length || !attackerCard) { 
        handlePass('opponent', true);
        return; 
    }

    const attPower = attackerCard.vaep + calculateTotalPowerBonus(state, attackerCard, 'player', 'attacker').bonus;
    const flippedCount = state.opponent.field.filter(c => c.isFlipped).length;
    const isLosing = state.opponent.score < state.player.score;

    const processedBlockers = blockers.map((b: Player) => {
      let power = getTruePower(state, b, 'defender', state.opponent.field);
      let weight = evaluateCardWeight(b, state);
      
      const isAggressive = b.effects?.includes("AGRESSIF");
      
      // LOGIQUE AGRESSIVITÉ DÉFENSIVE (FAUTES)
      // Ne prend le risque de penalty que si :
      // 1. L'IA perd au score
      // 2. OU le Momentum adverse est critique (2+ flips)
      // 3. OU le duel est gagnant de toute façon
      if (isAggressive && power === attPower) {
          const isMomentumCrit = flippedCount >= 2;
          if (!isLosing && !isMomentumCrit) {
              // Si on ne perd pas et pas d'urgence momentum, on évite la faute
              power -= 1; // On déclasse ce choix pour privilégier un bloqueur "propre"
              weight -= 20;
          }
      }

      return { card: b, power, weight };
    }).sort((a, b) => a.power - b.power);

    const winningBlockers = processedBlockers.filter(b => b.power > attPower);
    const drawBlockers = processedBlockers.filter(b => b.power === attPower);

    let finalBlocker;

    if (winningBlockers.length > 0) {
        finalBlocker = winningBlockers[0].card;
    } 
    else if (drawBlockers.length > 0) {
        finalBlocker = drawBlockers[0].card;
    } 
    else {
        if (flippedCount >= 2) {
            finalBlocker = processedBlockers.reduce((prev, curr) => curr.power > prev.power ? curr : prev).card;
        } else {
            finalBlocker = processedBlockers.reduce((prev, curr) => curr.weight < prev.weight ? curr : prev).card;
        }
    }

    handleBlock(finalBlocker.instanceId!); 
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
      const isCooldownOver = now - lastActionTime.current > 1000;

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
    
    stuckTimer.current = setTimeout(aiAction, 500); 

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
