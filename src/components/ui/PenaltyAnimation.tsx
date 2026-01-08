import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';

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
  const [step, setStep] = useState<'intro' | 'action' | 'result'>('intro');

  useEffect(() => {
    // Séquence d'animation
    const timer1 = setTimeout(() => setStep('action'), 2000); // Intro dure 2s
    const timer2 = setTimeout(() => setStep('result'), 4000); // Action dure 2s
    const timer3 = setTimeout(onComplete, 7000); // Résultat affiché 3s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
      >
        <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
            
            {/* ETAPE 1 : DUEL */}
            {step === 'intro' && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="flex flex-col items-center gap-8"
                >
                    <h2 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-xl">PENALTY</h2>
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-[#afff34] border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-black">
                                {attackerName.charAt(0)}
                            </div>
                            <span className="mt-4 text-xl font-bold text-white uppercase tracking-widest">{attackerName}</span>
                        </div>
                        <span className="text-4xl font-black text-white/50">VS</span>
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-red-600 border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-white">
                                {defenderName.charAt(0)}
                            </div>
                            <span className="mt-4 text-xl font-bold text-white uppercase tracking-widest">{defenderName}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ETAPE 2 : ACTION */}
            {step === 'action' && (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-9xl mb-4"
                    >
                        ⚽
                    </motion.div>
                    <span className="text-2xl font-black text-white uppercase tracking-[0.5em] animate-pulse">
                        SHOOTING...
                    </span>
                </motion.div>
            )}

            {/* ETAPE 3 : RESULTAT */}
            {step === 'result' && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <h1 className={`text-9xl font-black italic tracking-tighter mb-4 ${result === 'goal' ? 'text-[#afff34]' : 'text-red-500'}`}>
                        {result === 'goal' ? 'GOAL!' : 'SAVED!'}
                    </h1>
                    <div className="px-8 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-xl font-bold text-white uppercase tracking-widest">
                            {result === 'goal' ? `${attackerName} SCORES!` : `${defenderName} SAVES!`}
                        </span>
                    </div>
                </motion.div>
            )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PenaltyAnimation;
