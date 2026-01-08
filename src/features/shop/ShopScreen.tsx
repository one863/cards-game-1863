// src/features/shop/ShopScreen.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/useUserStore';
import { useLanguage } from '@/app/LanguageContext';
import BOOSTERS from '@/data/boosters.json';
import PackItem from './components/PackItem';
import RewardOverlay from './components/RewardOverlay';
import { Player } from '@/types';
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
        className="w-full h-full bg-[#050505] text-white flex flex-col relative overflow-hidden"
    >
      {/* Texture & Halos */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header - Glassmorphism */}
      <div className="flex justify-between items-center p-6 sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-xl">
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#afff34] uppercase tracking-[4px] mb-1">STADIUM STORE</span>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                {t('shop.title')}
            </h1>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                <span className="text-lg">💰</span>
                <span className="font-black text-[#FFD700] text-lg tracking-tight">{credits}</span>
            </div>
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
                <MdClose size={24} className="text-white/70" />
            </button>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mx-6 mt-4 bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl text-center font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
                {errorMsg}
            </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 gap-6 pb-24">
          {(BOOSTERS as any[]).map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <PackItem pack={pack} onBuy={handleBuy} disabled={openingPack !== null} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openingPack && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center"
            >
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 5, 0],
                        opacity: 1
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-9xl mb-12 filter drop-shadow-[0_0_50px_rgba(175,255,52,0.4)]"
                >
                    📦
                </motion.div>
                <h2 className="text-white font-black text-3xl uppercase tracking-[0.2em] animate-pulse drop-shadow-lg">
                    {t('shop.opening')}
                </h2>
            </motion.div>
        )}
      </AnimatePresence>

      {newCards && <RewardOverlay cards={newCards} onClose={() => setNewCards(null)} />}
    </motion.div>
  );
};

export default ShopScreen;
