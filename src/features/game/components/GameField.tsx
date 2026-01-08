import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/card/Card';
import { Player } from '@/types';
import { GAME_RULES } from '@/core/rules/settings';

interface GameFieldProps {
  field: Player[];
  sideKey: 'player' | 'opponent';
  attackerInstanceId: string | null;
  selectedAttackerId: string | null;
  turn: 'player' | 'opponent';
  phase: 'MAIN' | 'ATTACK_DECLARED';
  isMeneurActive?: boolean;
  getVisualBonus: (card: Player, side: 'player' | 'opponent') => number;
  onCardClick: (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => void;
  onDropCard: (dropIndex: number) => void;
}

const GameField: React.FC<GameFieldProps> = ({ 
  field, sideKey, attackerInstanceId, selectedAttackerId, turn, phase, isMeneurActive,
  getVisualBonus, onCardClick, onDropCard 
}) => {
  
  // Rendu d'un slot individuel
  const renderFieldSlot = (i: number) => {
    const card = field[i];
    const isAttacking = attackerInstanceId === card?.instanceId;
    const isSelected = sideKey === 'player' && selectedAttackerId === card?.instanceId;
    const canBlock = turn === sideKey && phase === 'ATTACK_DECLARED' && card && !card.isFlipped;
    const isEligibleForCamBonus = card && ['LW', 'RW', 'ST'].includes(card.pos);
    const canAttackBonus = isMeneurActive && turn === sideKey && isEligibleForCamBonus && !card.isFlipped && !card.hasActed;
    const isDroppable = !card && sideKey === 'player' && turn === 'player' && phase === 'MAIN';

    return (
        <div 
            key={`slot-${sideKey}-${i}`} 
            className={`w-full aspect-[3/4] bg-black/30 rounded-xl border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] overflow-visible transition-colors ${isDroppable ? 'hover:border-[#afff34]/50 bg-white/5' : ''}`}
            onDragOver={(e) => { if (isDroppable) e.preventDefault(); }} 
            onDrop={(e) => { if (isDroppable) onDropCard(i); }}
        >
            {!card && <div className="w-1 h-1 rounded-full bg-white/10" />}
            <AnimatePresence>
                {card && (
                    <motion.div 
                        key={card.instanceId} 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className={`absolute inset-0 z-10 ${canAttackBonus ? 'cursor-pointer ring-4 ring-[#afff34]/50 rounded-xl animate-pulse' : ''}`}
                    >
                        <Card 
                            data={card} isMomentum={card.isFlipped} 
                            isAttacking={isAttacking} isSelected={isSelected} canBlock={canBlock}
                            hasActed={card.hasActed} bonus={getVisualBonus(card, sideKey)} 
                            onClick={() => onCardClick(card, sideKey, 'field', i)}
                            teamColor={sideKey === 'player' ? '#afff34' : '#ef4444'} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  return (
    // GRILLE EXACTE DE 5 COLONNES
    <div className="grid grid-cols-5 gap-2 w-full max-w-[450px] px-4 mx-auto">
        {Array.from({ length: 5 }).map((_, i) => renderFieldSlot(i))}
    </div>
  );
};

export default GameField;
