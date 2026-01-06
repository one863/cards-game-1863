import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/card/Card';
import { Player } from '../../../types';
import { GAME_RULES } from '../../../core/rules/settings';

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
  onDropCard: (dropIndex: number) => void; // --- NOUVELLE PROP ---
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
    
    // Un slot est droppable s'il est vide et que c'est le tour du joueur
    const isDroppable = !card && sideKey === 'player' && turn === 'player' && phase === 'MAIN';

    return (
        <div 
            key={`slot-${sideKey}-${i}`} 
            className={`flex-1 aspect-[2/3] max-w-[19%] bg-black/20 rounded-xl border border-white/5 flex items-center justify-center relative shadow-inner overflow-visible ${isDroppable ? 'hover:border-[#afff34]/80 transition-colors' : ''}`}
            onDragOver={(e) => { if (isDroppable) e.preventDefault(); }} // Permet le drop
            onDrop={(e) => { if (isDroppable) onDropCard(i); }} // Gère le drop sur cet emplacement
        >
            {!card && <div className="w-1.5 h-1.5 rounded-full bg-white/5" />}
            <AnimatePresence>
                {card && (
                    <motion.div 
                        key={card.instanceId} 
                        initial={{ opacity: 0, scale: 0.8 }} 
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
                        {canAttackBonus && (
                            <div className="absolute -top-2 -right-2 bg-[#afff34] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg z-20 animate-bounce">
                                ATT!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="w-full flex justify-center gap-3">
            {Array.from({ length: GAME_RULES.FIELD_SIZE }).map((_, i) => renderFieldSlot(i))}
        </div>
    </div>
  );
};

export default GameField;
