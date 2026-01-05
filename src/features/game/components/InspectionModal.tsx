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

  const handleActionClick = (type: GameActionType) => {
    onClose();
    setTimeout(() => onAction(type), 50);
  };

  const getActionButtonStyles = (type: GameActionType) => {
    switch (type) {
      case 'ATTACK': return 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]';
      case 'BLOCK': return 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]';
      case 'PLAY': return 'bg-[#afff34] text-black shadow-[0_0_20px_rgba(175,255,52,0.4)]';
      case 'BOOST': return 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]';
      default: return 'bg-[#afff34] text-black shadow-[0_0_20px_rgba(175,255,52,0.4)]';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
    >
        {/* Overlay rendu encore plus transparent (bg-black/20 au lieu de bg-black/40) 🔥 */}
        <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

        <motion.div 
          initial={{ scale: 0.8, y: 50, opacity: 0 }} 
          animate={{ scale: 1, y: 0, opacity: 1 }} 
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm pointer-events-none" 
        >
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all pointer-events-auto backdrop-blur-md border border-white/20"
            >
                <MdClose size={24} />
            </button>

            <div className="w-64 md:w-72 aspect-[2/3] shadow-[0_0_100px_rgba(0,0,0,1)] pointer-events-auto">
                <Card 
                  data={inspectedCard.card} 
                  teamColor={inspectedCard.side === 'player' ? '#afff34' : '#ef4444'} 
                  isMomentum={inspectedCard.card.isFlipped}
                  isLarge={true}
                />
            </div>

            <div className="w-full flex flex-col gap-3 pointer-events-auto px-6">
                <div className="flex gap-3 w-full justify-center">
                    {actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(action.type)}
                          className={`${getActionButtonStyles(action.type)} flex-1 max-w-[140px] px-2 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border border-white/20 shadow-2xl`}
                        >
                            {React.cloneElement(action.icon as React.ReactElement, { size: 20 })}
                            {action.label}
                        </button>
                    ))}
                </div>
                
                {actions.length === 0 && (
                  <button onClick={onClose} className="w-full bg-black/60 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 backdrop-blur-md">
                      {t('game.close')}
                  </button>
                )}
            </div>
        </motion.div>
    </motion.div>
  );
};

export default InspectionModal;
