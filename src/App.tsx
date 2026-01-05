// src/App.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Context & Stores
import { useLanguage } from './app/LanguageContext';
import { useUserStore } from './stores/useUserStore';
import { useGameStore } from './stores/useGameStore';

// Écrans (Screens)
import MercatoScreen from './features/mercato/MercatoScreen';
import GameScreen from './features/game/GameScreen';
import ShopScreen from './features/shop/ShopScreen';
import TeamSelectionScreen from './features/game/TeamSelectionScreen';

const App = () => {
  const { t, langCode, setLanguage } = useLanguage();
  
  // Zustand Stores
  const { credits, initStarterPack } = useUserStore();
  const { gameState, quitMatch } = useGameStore();

  const [currentView, setCurrentView] = useState('menu');

  useEffect(() => {
    initStarterPack();
  }, [initStarterPack]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const renderContent = () => {
    // 1. GAME SCREEN
    if (gameState) {
        return (
            <div className="w-full h-full bg-black relative overflow-hidden">
                <GameScreen onQuit={quitMatch} />
            </div>
        );
    }

    // 2. AUTRES ECRANS
    switch (currentView) {
        case 'builder':
            return <div className="w-full h-full bg-black relative"><MercatoScreen onBackToMenu={() => setCurrentView('menu')} /></div>;
        case 'shop':
            return <div className="w-full h-full bg-black relative"><ShopScreen onBack={() => setCurrentView('menu')} /></div>;
        case 'quick_match':
            return <div className="w-full h-full bg-black relative"><TeamSelectionScreen onBack={() => setCurrentView('menu')} /></div>;
        case 'menu':
        default:
            return (
                <motion.div 
                    variants={pageVariants} initial="initial" animate="animate" exit="exit"
                    className="flex flex-col h-full w-full items-center justify-center p-6 relative bg-black text-white"
                >
                    {/* Header */}
                    <div className="absolute top-6 right-6 flex gap-3 z-50">
                        <div className="flex items-center gap-2 bg-[#111] px-4 py-2 rounded-full border border-[#333]">
                            <span className="text-xl">💰</span><span className="font-bold text-[#FFD700] text-lg">{credits}</span>
                        </div>
                        <div className="flex gap-2 bg-[#111] p-2 rounded-full border border-[#333]">
                            <button onClick={() => setLanguage('fr')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${langCode === 'fr' ? 'bg-white text-black' : 'text-[#666]'}`}>FR</button>
                            <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${langCode === 'en' ? 'bg-white text-black' : 'text-[#666]'}`}>EN</button>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-16">
                        <motion.h1 
                            animate={{ scale: [1, 1.02, 1], textShadow: ["0 0 15px rgba(175, 255, 52, 0.5)", "0 0 25px rgba(175, 255, 52, 0.8)", "0 0 15px rgba(175, 255, 52, 0.5)"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[12vh] font-black tracking-[-5px] text-white leading-none mb-4"
                        >
                            1863
                        </motion.h1>
                        <p className="text-sm text-[#888] uppercase tracking-[4px] font-bold">{t('menu.title')}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-4 px-4 max-w-xs">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView('quick_match')}
                            className="w-full py-5 text-black text-lg font-black uppercase rounded-xl shadow-[0_0_20px_rgba(175,255,52,0.3)] bg-[#afff34]"
                        >
                            {t('menu.quick_match')}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView('builder')}
                            className="w-full py-5 bg-[#111] border border-[#333] text-white text-lg font-bold uppercase rounded-xl"
                        >
                            {t('menu.my_team')}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView('shop')}
                            className="w-full py-5 bg-[#111] border border-[#333] text-white font-bold uppercase rounded-xl flex items-center justify-center gap-2"
                        >
                            🛒 {t('menu.shop')}
                        </motion.button>
                    </div>

                    <div className="absolute bottom-6 text-[#444] text-[0.6rem] tracking-[2px] font-bold">PROJET 1863 — ONE863</div>
                </motion.div>
            );
    }
  };

  return (
      <div className="w-full h-full bg-[#111] flex items-center justify-center p-0 md:p-4"> {/* Réduction padding */}
        <div className="w-full h-full md:w-[450px] md:h-[96vh] md:max-h-[1000px] bg-black md:rounded-[30px] md:border-[8px] md:border-[#222] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="w-full h-full relative flex-1">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
      </div>
  );
};

export default App;
