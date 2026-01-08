import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/types';
import Card from '@/components/card/Card';

export type GameActionType = 'PLAY' | 'ATTACK' | 'BLOCK' | 'BOOST';

interface InspectionModalProps {
  card: Player;
  onClose: () => void;
  actions: { type: GameActionType; label: string; icon: React.ReactNode }[];
  onAction: (type: GameActionType) => void;
  side: 'player' | 'opponent';
}

const InspectionModal: React.FC<InspectionModalProps> = ({ 
  card, onClose, actions, onAction, side 
}) => {
  
  const getActionColor = (type: GameActionType) => {
      switch(type) {
          case 'ATTACK': return 'bg-[#ff9f34] text-black hover:bg-[#ffbf70]';
          case 'BLOCK': return 'bg-blue-600 text-white hover:bg-blue-500';
          case 'PLAY': return 'bg-[#afff34] text-black hover:bg-[#cfff70]';
          case 'BOOST': return 'bg-purple-600 text-white hover:bg-purple-500';
          default: return 'bg-white text-black';
      }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-[350px] aspect-[3/4] perspective-1000"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Carte Large - Taille garantie identique pour tous */}
            <div className="w-full h-full shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                <Card 
                    data={card}
                    isLarge={true}
                    teamColor={side === 'player' ? '#afff34' : '#ff3333'} 
                />
            </div>

            {/* Actions Flottantes - Positionnées pour ne pas altérer la taille de la carte */}
            {actions.length > 0 && (
                <div className="absolute -bottom-24 left-0 right-0 flex flex-col gap-2 z-50">
                    {actions.map((action, i) => (
                        <motion.button
                            key={action.type}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => onAction(action.type)}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform ${getActionColor(action.type)}`}
                        >
                            {action.icon}
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InspectionModal;
