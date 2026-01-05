import React from 'react';
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import Card from '../../../components/card/Card';
import { Player } from '../../../types';
import { useLanguage } from '../../../app/LanguageContext';

export type GameActionType = 'PLAY' | 'ATTACK' | 'BLOCK' | 'BOOST';

interface InspectionModalProps {
  inspectedCard: { 
    card: Player, 
    side: 'player' | 'opponent',
    zone: 'hand' | 'field',
    idx: number
  } | null;
  onClose: () => void;
  actions: { type: GameActionType; label: string; icon: React.ReactNode }[];
  onAction: (type: GameActionType) => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ 
  inspectedCard, 
  onClose, 
  actions, 
  onAction 
}) => {
  const { t } = useLanguage();

  if (!inspectedCard) return null;

  const getActionButtonStyles = (type: GameActionType) => {
    switch (type) {
      case 'ATTACK':
        return 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]';
      case 'BLOCK':
        return 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]';
      case 'PLAY':
        return 'bg-[#afff34] text-black shadow-[0_0_20px_rgba(175,255,52,0.4)]';
      case 'BOOST':
        return 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]';
      default:
        return 'bg-[#afff34] text-black shadow-[0_0_20px_rgba(175,255,52,0.4)]';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 z-[200] backdrop-blur-md flex items-center justify-center p-6"
    >
        {/* Overlay cliquable pour fermer */}
        <div className="absolute inset-0" onClick={onClose}></div>

        <motion.div 
          initial={{ scale: 0.8, y: 50, opacity: 0 }} 
          animate={{ scale: 1, y: 0, opacity: 1 }} 
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md pointer-events-none" 
        >
            <div className="w-72 md:w-80 aspect-[2/3] shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-auto">
                <Card 
                  data={inspectedCard.card} 
                  teamColor={inspectedCard.side === 'player' ? '#afff34' : '#ef4444'} 
                  isMomentum={inspectedCard.card.isFlipped}
                  isLarge={true}
                />
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full pointer-events-auto px-4">
                {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => onAction(action.type)}
                      className={`${getActionButtonStyles(action.type)} flex-1 min-w-[140px] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-3 border border-white/20`}
                    >
                        {React.cloneElement(action.icon as React.ReactElement, { size: 20 })}
                        {action.label}
                    </button>
                ))}
                
                <button 
                  onClick={onClose}
                  className="w-full mt-2 bg-black/60 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black/80 transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md shadow-xl"
                >
                    <MdClose size={20} />
                    {t('game.close')}
                </button>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default InspectionModal;