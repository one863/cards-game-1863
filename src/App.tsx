// src/App.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/index.css';

// Context & Stores
import { useLanguage } from '@/app/LanguageContext';
import { useUserStore } from '@/stores/useUserStore';
import { useGameStore } from '@/stores/useGameStore';

// Écrans (Screens)
import MercatoScreen from '@/features/mercato/MercatoScreen';
import GameScreen from '@/features/game/GameScreen';
import ShopScreen from '@/features/shop/ShopScreen';
import TeamSelectionScreen from '@/features/game/TeamSelectionScreen';

const App = () => {
  const { t, langCode, setLanguage } = useLanguage();
  const { credits, initStarterPack } = useUserStore();
  const { gameState, quitMatch } = useGameStore();

  const [currentView, setCurrentView] = useState('menu');

  useEffect(() => {
    initStarterPack();
  }, [initStarterPack]);

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } }
  };

  const renderContent = () => {
    if (gameState) {
        return (
            <div className="w-full h-full bg-black relative overflow-hidden">
                <GameScreen onQuit={quitMatch} />
            </div>
        );
    }

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
                    className="flex flex-col h-full w-full items-center justify-center p-8 relative bg-black text-white overflow-hidden"
                >
                    {/* Texture de fond premium */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                    
                    {/* Halos lumineux Expressive */}
                    <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-[#afff34]/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#afff34]/5 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Header - Glassmorphism */}
                    <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-50">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                            <span className="text-lg">💰</span>
                            <span className="font-black text-[#FFD700] text-lg tracking-tight">{credits}</span>
                        </div>
                        <div className="flex gap-1 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-xl">
                            <button onClick={() => setLanguage('fr')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${langCode === 'fr' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}>FR</button>
                            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${langCode === 'en' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}>EN</button>
                        </div>
                    </div>

                    {/* Logo - Style Expressive */}
                    <div className="flex flex-col items-center mb-20 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <motion.h1 
                                animate={{ 
                                    textShadow: [
                                        "0 0 20px rgba(175, 255, 52, 0.3)", 
                                        "0 0 40px rgba(175, 255, 52, 0.6)", 
                                        "0 0 20px rgba(175, 255, 52, 0.3)"
                                    ] 
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="text-[14vh] font-black tracking-[-8px] text-white leading-none italic"
                            >
                                1863
                            </motion.h1>
                            <div className="absolute -inset-2 bg-[#afff34]/20 blur-2xl -z-10 rounded-full"></div>
                        </motion.div>
                        <p className="text-[10px] text-[#afff34] uppercase tracking-[6px] font-black mt-2 drop-shadow-glow">{t('menu.title')}</p>
                    </div>

                    {/* Actions - Boutons surélevés */}
                    <div className="flex flex-col w-full gap-4 px-4 max-w-sm relative z-10">
                        <motion.button 
                            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} 
                            onClick={() => setCurrentView('quick_match')}
                            className="w-full py-6 text-black text-xl font-black uppercase rounded-2xl shadow-[0_20px_40px_rgba(175,255,52,0.2)] bg-[#afff34] border-t border-white/40"
                        >
                            {t('menu.quick_match')}
                        </motion.button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                                onClick={() => setCurrentView('builder')}
                                className="py-5 bg-white/5 backdrop-blur-lg border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all shadow-xl"
                            >
                                {t('menu.my_team')}
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                                onClick={() => setCurrentView('shop')}
                                className="py-5 bg-white/5 backdrop-blur-lg border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all shadow-xl"
                            >
                                {t('menu.shop')}
                            </motion.button>
                        </div>
                    </div>

                    <div className="absolute bottom-8 text-white/20 text-[7px] font-black tracking-[4px] uppercase italic">
                        Football Tactical Experience • Ver 1.0
                    </div>
                </motion.div>
            );
    }
  };

  return (
      <div className="w-full h-full bg-[#050505] flex items-center justify-center p-0 md:p-4">
        <div className="w-full h-full md:w-[440px] md:h-[92vh] md:max-h-[900px] bg-black md:rounded-[48px] md:border-[12px] md:border-[#1a1a1a] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] relative flex flex-col">
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
