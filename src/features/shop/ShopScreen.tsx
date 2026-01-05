// src/features/shop/ShopScreen.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { useLanguage } from '../../app/LanguageContext';
import BOOSTERS from '../../data/boosters.json';
import PackItem from './components/PackItem';
import RewardOverlay from './components/RewardOverlay';
import { Player } from '../../types';
import { MdClose, MdAttachMoney } from 'react-icons/md';

interface ShopScreenProps {
  onBack: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { credits, buyBooster } = useUserStore();
  
  const [openingPack, setOpeningPack] = useState<string | null>(null); 
  const [newCards, setNewCards] = useState<Player[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuy = (packId: string) => {
    setErrorMsg(null);
    const result = buyBooster(packId);
    if (result.success && result.cards) {
      setOpeningPack(packId);
      setTimeout(() => {
        setNewCards(result.cards!);
        setOpeningPack(null); 
      }, 2000);
    } else {
      setErrorMsg(result.message || "Error");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full bg-[#111] text-white flex flex-col p-4 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 z-40 bg-[#111]/90 backdrop-blur-md py-2 border-b border-white/5">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <span className="text-[#afff34]">🛒</span> {t('shop.title')}
        </h1>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black px-3 py-1.5 rounded-full border border-[#333]">
                <span className="text-yellow-400 text-sm"><MdAttachMoney /></span>
                <span className="font-mono font-bold text-white text-sm">{credits}</span>
            </div>
            <button onClick={onBack} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <MdClose size={20} className="text-white/50 hover:text-white" />
            </button>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-center font-bold text-sm"
            >
                {errorMsg}
            </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 gap-4 pb-20 overflow-y-auto">
        {(BOOSTERS as any[]).map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <PackItem pack={pack} onBuy={handleBuy} disabled={openingPack !== null} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {openingPack && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-sm"
            >
            <motion.div 
                animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-8 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
                📦
            </motion.div>
            <h2 className="text-white font-black text-2xl uppercase tracking-widest animate-pulse">{t('shop.opening')}</h2>
            </motion.div>
        )}
      </AnimatePresence>

      {newCards && <RewardOverlay cards={newCards} onClose={() => setNewCards(null)} />}
    </motion.div>
  );
};

export default ShopScreen;
