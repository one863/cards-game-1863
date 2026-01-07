import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../stores/useGameStore';
import { useLanguage } from '../../../app/LanguageContext';
import MiniCard from '../../../components/card/MiniCard';
import { MdClose, MdVisibility, MdLock, MdLayers } from 'react-icons/md';

const DeckPileModal: React.FC = () => {
  const { t } = useLanguage();
  const isDeckOpen = useGameStore(state => state.isDeckOpen);
  const canViewDeck = useGameStore(state => state.canViewDeck);
  const setDeckOpen = useGameStore(state => state.setDeckOpen);
  const deckPile = useGameStore(state => state.gameState?.player.deck || []);

  const defaultTeamColor = '#afff34';

  if (!isDeckOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', damping: 25 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[120] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center pt-10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              {canViewDeck ? <MdVisibility className="w-5 h-5 text-blue-500" /> : <MdLock className="w-5 h-5 text-white/30" />}
            </div>
            <div>
              <h2 className="text-[#afff34] font-black uppercase tracking-widest text-sm">{t('game.deck')}</h2>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{deckPile.length} {t('game.cards') || 'cartes'}</p>
            </div>
          </div>
          <button 
            onClick={() => setDeckOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <MdClose size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!canViewDeck ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <MdLock size={32} />
                  </div>
                  <div className="text-center px-6">
                      <p className="text-xs font-bold text-[#afff34] uppercase tracking-wider mb-2">{t('game.content_locked') || 'Verrouillé'}</p>
                      <p className="text-[10px] uppercase font-mono text-white/40 max-w-[200px] leading-relaxed">
                        {t('game.scouting_needed') || 'Effet Scouting requis.'}
                      </p>
                  </div>
              </div>
          ) : deckPile.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
              <MdLayers size={32} />
              <p className="text-sm font-mono uppercase">{t('game.deck_empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-8">
              {deckPile.map((card, index) => (
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

        {/* Footer */}
        {canViewDeck && (
          <div className="p-4 border-t border-white/5 bg-black/20">
              <p className="text-[9px] text-center text-white/30 uppercase tracking-widest font-mono">
              {t('game.deck_info') || 'Ordre aléatoire'}
              </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DeckPileModal;
