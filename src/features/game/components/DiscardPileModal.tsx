import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../stores/useGameStore';
import { useLanguage } from '../../../app/LanguageContext';
import MiniCard from '../../../components/card/MiniCard'; 
import { MdClose, MdRestore } from 'react-icons/md';

const DiscardPileModal: React.FC = () => {
  const { t } = useLanguage();
  const isDiscardOpen = useGameStore(state => state.isDiscardOpen);
  const setDiscardOpen = useGameStore(state => state.setDiscardOpen);
  const discardPile = useGameStore(state => state.gameState?.player.discard || []);

  const defaultTeamColor = '#afff34'; 

  if (!isDiscardOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', damping: 25 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[120] flex flex-col" // Fond transparent + Blur
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center pt-10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <MdRestore className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-[#afff34] font-black uppercase tracking-widest text-sm">{t('game.discard')}</h2>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{discardPile.length} {t('game.cards') || 'cartes'}</p>
            </div>
          </div>
          <button 
            onClick={() => setDiscardOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <MdClose size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {discardPile.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
              <MdRestore size={32} />
              <p className="text-sm font-mono uppercase">{t('game.discard_empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-8">
              {discardPile.map((card, index) => (
                <div key={card.instanceId || index} className="aspect-[3/4] w-full min-w-0">
                  <MiniCard 
                      data={card}
                      showBack={false}
                      isInHand={false}
                      teamColor={defaultTeamColor}
                      bonus={0}
                      statusClasses="border-white/10 shadow-lg"
                      shouldDim={false}
                      onClick={() => {}} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <p className="text-[9px] text-center text-white/30 uppercase tracking-widest font-mono">
            {t('game.discard_info') || 'Zone de récupération'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscardPileModal;
