import React from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import ExplosionAnimation from '../../../components/ui/ExplosionAnimation';
import BoostAnimation from '../../../components/ui/BoostAnimation';
import GoalAnimation from '../../../components/ui/GoalAnimation';
import PenaltyAnimation from '../../../components/ui/PenaltyAnimation'; // --- NOUVEL IMPORT ---

interface VisualEffectsLayerProps {
  onResumeGame: () => void;
}

const VisualEffectsLayer: React.FC<VisualEffectsLayerProps> = ({ onResumeGame }) => {
  const { gameState, clearExplosion, clearBoost, clearPenalty } = useGameStore();

  if (!gameState) return null;

  return (
    <>
      {/* 1. Explosion (AGRESSIF) */}
      <ExplosionAnimation 
        active={!!gameState.explosionEvent?.active} 
        onComplete={clearExplosion} 
      />

      {/* 2. Boost (Power-up) */}
      <BoostAnimation 
        active={!!gameState.boostEvent?.active} 
        val={gameState.boostEvent?.val || 0} 
        side={gameState.boostEvent?.side || 'player'} 
        onComplete={clearBoost} 
      />

      {/* 3. Goal (But uniquement) */}
      {gameState.goalEvent && gameState.goalEvent.type === 'goal' && (
        <GoalAnimation 
          type={gameState.goalEvent.type} 
          scorer={gameState.goalEvent.scorer} 
          scorerName={gameState.goalEvent.scorerName} 
          reason={gameState.goalEvent.reason}
          playerScore={gameState.player.score}
          opponentScore={gameState.opponent.score}
          teamNames={{ player: gameState.player.teamName, opponent: gameState.opponent.teamName }}
          onComplete={onResumeGame}
        />
      )}

      {/* 4. Penalty Animation */}
      {gameState.penaltyEvent?.active && gameState.penaltyEvent.result && (
          <PenaltyAnimation 
              attackerName={gameState.penaltyEvent.attackerName}
              defenderName={gameState.penaltyEvent.defenderName}
              result={gameState.penaltyEvent.result}
              onComplete={clearPenalty}
          />
      )}
    </>
  );
};

export default VisualEffectsLayer;
