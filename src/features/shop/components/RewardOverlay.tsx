import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/card/Card';
import { Player } from '../../../types';
import { useLanguage } from '../../../app/LanguageContext';

interface RewardOverlayProps {
  cards: Player[];
  onClose: () => void;
}

const RewardOverlay: React.FC<RewardOverlayProps> = ({ cards, onClose }) => {
  const { t } = useLanguage();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md"
    >
      <motion.h2 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-black text-white uppercase tracking-tighter mb-8 text-center"
      >
        <span className="text-[#afff34]">★</span> {t('shop.new_cards')} <span className="text-[#afff34]">★</span>
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-4xl">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20, 
                delay: i * 0.2 
            }}
            className="w-24 h-36 md:w-32 md:h-48 shadow-[0_0_30px_rgba(175,255,52,0.2)]"
          >
            <Card data={card} />
          </motion.div>
        ))}
      </div>

      <motion.button 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: cards.length * 0.2 + 0.5 }}
        className="px-8 py-3 bg-[#afff34] text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(175,255,52,0.5)] hover:bg-[#9ee020] hover:scale-105 transition-all"
        onClick={onClose}
      >
        {t('game.continue')}
      </motion.button>
    </motion.div>
  );
};

export default RewardOverlay;
