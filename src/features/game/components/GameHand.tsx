import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/card/Card';
import { Player } from '../../../types';

interface GameHandProps {
  hand: Player[];
  sideKey: 'player' | 'opponent';
  selectedBoostId: string | null;
  onCardClick: (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => void;
  onDragStart?: (event: React.DragEvent, card: Player, cardIndex: number) => void; // --- NOUVELLE PROP ---
}

const GameHand: React.FC<GameHandProps> = ({ hand, sideKey, selectedBoostId, onCardClick, onDragStart }) => {
  const isPlayer = sideKey === 'player';
  const teamColor = isPlayer ? '#afff34' : '#ef4444';

  return (
    <div className="h-32 shrink-0 flex justify-center items-center px-8 relative z-40 w-full">
        <div className={`flex gap-2 justify-center ${isPlayer ? 'items-end' : 'items-center'} w-full max-w-3xl`}>
            <AnimatePresence>
                {hand.map((card, i) => (
                    <div 
                        key={card.instanceId || `hand-${sideKey}-${i}`} 
                        className={`relative w-[18%] max-w-[85px] aspect-[2/3] ${!isPlayer ? 'opacity-40' : ''}`}
                        draggable={isPlayer && !!onDragStart} // Seulement si c'est le joueur et que le drag est activé
                        onDragStart={(e) => isPlayer && onDragStart && onDragStart(e, card, i)} // Passer l'index
                        onDragOver={(e) => e.preventDefault()} // Nécessaire pour que le drop fonctionne sur les enfants
                    >
                         {isPlayer ? (
                             <motion.div 
                                initial={{ y: 50, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1 }} 
                                exit={{ scale: 0, opacity: 0 }}
                                className="w-full h-full hover:scale-110 hover:-translate-y-4 transition-transform duration-200 z-10 hover:z-50 shadow-2xl origin-bottom"
                             >
                                <Card 
                                    data={card} 
                                    isSelected={selectedBoostId === card.instanceId} 
                                    onClick={() => onCardClick(card, 'player', 'hand', i)} 
                                    teamColor={teamColor} 
                                    isInHand={true}
                                />
                             </motion.div>
                         ) : (
                             <div className="w-full h-full">
                                <Card isHidden={true} teamColor={teamColor} />
                             </div>
                         )}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default GameHand;
