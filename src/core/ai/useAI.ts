import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { getAIDecision } from './logic/aiDecision';
import { getTruePower } from './logic/scorers/powerScorer';
import { evaluateCardWeight } from './logic/scorers/cardScorer';
import { calculateTotalPowerBonus } from '../../core/engine/effectSystem';
import { GameState, Player } from '../../types';

const useAI = () => {
  const gameState = useGameStore(state => state.gameState);
  const handlePlayCard = useGameStore(state => state.handlePlayCard);
  const handleAttack = useGameStore(state => state.handleAttack);
  const handleBlock = useGameStore(state => state.handleBlock);
  const handlePass = useGameStore(state => state.handlePass);
  const addLog = useGameStore(state => state.addLog);

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

    const processedBlockers = blockers.map((b: Player) => {
      let power = getTruePower(state, b, 'defender', state.opponent.field);
      let weight = evaluateCardWeight(b, state);
      
      // RÈGLE 1 : ÉVITER LE RISQUE AGRESSIF
      // Si le défenseur est agressif et que le duel est serré (Egalité possible), c'est dangereux (Penalty)
      const isAggressive = b.effects?.includes("AGRESSIF");
      if (isAggressive && power === attPower) {
          // On pénalise artificiellement ce choix pour que l'IA en choisisse un autre si possible
          power -= 0.5; // Juste assez pour qu'il ne soit pas considéré comme un "Draw" parfait
          weight -= 10;
      }

      return { card: b, power, weight };
    }).sort((a, b) => a.power - b.power);

    const winningBlockers = processedBlockers.filter(b => b.power > attPower);
    const drawBlockers = processedBlockers.filter(b => b.power === attPower); // Note: Les agressifs ont power -= 0.5 donc ne seront pas ici

    let finalBlocker;

    if (winningBlockers.length > 0) {
        finalBlocker = winningBlockers[0].card; // Le plus faible des gagnants
    } 
    else if (drawBlockers.length > 0) {
        finalBlocker = drawBlockers[0].card; // Draw standard
    } 
    else {
        // PERTE DU DUEL
        if (flippedCount >= 2) {
            // MODE SURVIE : On prend le plus fort pour maximiser les chances (ou un agressif même si risqué, car perdu pour perdu...)
            // Ici, on prend le max power réel (sans le malus artificiel)
            finalBlocker = processedBlockers.reduce((prev, curr) => curr.power > prev.power ? curr : prev).card;
        } else {
            // SACRIFICE : Le moins utile
            finalBlocker = processedBlockers.reduce((prev, curr) => curr.weight < prev.weight ? curr : prev).card;
        }
    }

    handleBlock(finalBlocker.instanceId!); 
  };

  const handleMainPhase = (state: GameState) => {
    const decision = getAIDecision(state);
    
    console.log(`AI Loop: Action=${decision.action}, Phase=${state.phase}, Turn=${state.turn}`);

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
