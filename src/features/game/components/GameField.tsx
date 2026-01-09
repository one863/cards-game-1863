import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/card/Card';
import { Player } from '@/types';
import { GAME_RULES } from '@/core/rules/settings';
import { THEME } from '@/styles/theme';

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
            className={`w-full aspect-[3/4] rounded-xl relative transition-all duration-300 overflow-hidden ${
                card 
                ? 'bg-transparent shadow-none border-none' 
                : 'bg-black/20 border border-white/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]'
            } ${isDroppable ? 'hover:border-[#afff34]/30 hover:bg-white/5' : ''}`}
            onDragOver={(e) => { if (isDroppable) e.preventDefault(); }} 
            onDrop={(e) => { if (isDroppable) onDropCard(i); }}
        >
            {!card && <div className="w-1.5 h-1.5 rounded-full bg-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
            <AnimatePresence>
                {card && (
                    <motion.div 
                        key={card.instanceId} 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1.01 }}
                        className={`absolute inset-0 z-10 ${canAttackBonus ? 'cursor-pointer ring-4 ring-[#afff34]/40 rounded-xl animate-pulse' : ''}`}
                    >
                        <Card 
                            data={card} isMomentum={card.isFlipped} 
                            isAttacking={isAttacking} isSelected={isSelected} canBlock={canBlock}
                            hasActed={card.hasActed} bonus={getVisualBonus(card, sideKey)} 
                            onClick={() => onCardClick(card, sideKey, 'field', i)}
                            teamColor={sideKey === 'player' ? THEME.colors.player : THEME.colors.opponent} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-[450px] px-4 mx-auto">
        {Array.from({ length: 5 }).map((_, i) => renderFieldSlot(i))}
    </div>
  );
};

export default GameField;