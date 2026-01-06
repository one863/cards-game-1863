import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../app/LanguageContext';

interface PenaltyAnimationProps {
  attackerName: string;
  defenderName: string;
  result: 'goal' | 'saved';
  onComplete: () => void;
}

const PenaltyAnimation: React.FC<PenaltyAnimationProps> = ({ 
  attackerName, defenderName, result, onComplete 
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'intro' | '3' | '2' | '1' | 'shoot' | 'result'>('intro');

  useEffect(() => {
    const timers = [
        setTimeout(() => setStep('3'), 1000),
        setTimeout(() => setStep('2'), 2000),
        setTimeout(() => setStep('1'), 3000),
        setTimeout(() => setStep('shoot'), 4000),
        setTimeout(() => setStep('result'), 4500),
        setTimeout(() => onComplete(), 7000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
    >
        {/* ARRIÈRE PLAN DYNAMIQUE */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-t from-black to-transparent ${step === 'result' && result === 'goal' ? 'bg-green-500' : (step === 'result' ? 'bg-red-500' : '')}`} />

        <AnimatePresence mode="wait">
            {step === 'intro' && (
                <motion.div key="intro" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="text-center z-10">
                    <h2 className="text-white text-sm font-black tracking-[0.3em] uppercase mb-4 opacity-50">ÉVÉNEMENT EXCEPTIONNEL</h2>
                    <h1 className="text-6xl md:text-8xl font-black text-red-500 italic tracking-tighter drop-shadow-2xl">PENALTY !</h1>
                    <p className="text-white font-bold mt-6">{attackerName} 🆚 {defenderName}</p>
                </motion.div>
            )}

            {(step === '3' || step === '2' || step === '1') && (
                <motion.div key={step} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="z-10">
                    <span className="text-[15rem] font-black text-white italic drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">{step}</span>
                </motion.div>
            )}

            {step === 'shoot' && (
                <motion.div key="shoot" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="z-10 flex flex-col items-center">
                    <div className="w-4 h-4 bg-white rounded-full animate-ping mb-4" />
                    <span className="text-4xl font-black text-white uppercase italic tracking-widest">LE TIR !</span>
                </motion.div>
            )}

            {step === 'result' && (
                <motion.div key="result" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 text-center">
                    <motion.h2 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className={`text-8xl md:text-9xl font-black italic tracking-tighter uppercase drop-shadow-2xl ${result === 'goal' ? 'text-[#afff34]' : 'text-red-500'}`}
                    >
                        {result === 'goal' ? 'BUT !' : 'ARRÊTÉ !'}
                    </motion.h2>
                    <p className="text-white font-bold mt-8 text-xl uppercase tracking-widest bg-white/5 px-8 py-3 rounded-full border border-white/10 backdrop-blur-md">
                        {result === 'goal' ? `${attackerName} MARQUE !` : `${defenderName} FAIT L'ARRÊT !`}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Effet visuel balle */}
        {step === 'shoot' && (
            <motion.div 
                initial={{ y: 300, scale: 2 }} 
                animate={{ y: -500, scale: 0.1 }} 
                transition={{ duration: 0.5, ease: "easeIn" }}
                className="absolute bottom-20 w-12 h-12 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,1)] z-20"
            />
        )}
    </motion.div>
  );
};

export default PenaltyAnimation;
