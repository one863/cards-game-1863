import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';

interface GoalAnimationProps {
  type: 'goal' | 'GAME_OVER'; 
  scorer?: 'player' | 'opponent';
  scorerName?: string;
  reason?: string;
  playerScore?: number;
  opponentScore?: number;
  teamNames?: { player: string; opponent: string };
  onComplete?: () => void; 
}

const GoalAnimation: React.FC<GoalAnimationProps> = ({ 
  type, scorer, scorerName, reason, playerScore = 0, opponentScore = 0, teamNames, onComplete
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (type === 'goal' && onComplete) {
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  if (type === 'GAME_OVER') return null;

  // Calcul du texte de la raison
  const getReasonText = () => {
    if (!reason) return null;
    if (reason === 'logs.goal_momentum_pressure') {
      const defenderSideName = scorer === 'player' ? (teamNames?.opponent || 'OPP') : (teamNames?.player || 'YOU');
      return t(reason, { teamName: defenderSideName });
    }
    return t(reason);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
        onClick={onComplete} 
      >
        <div className="relative flex flex-col items-center w-full">
            {/* EFFETS DE LUMIERE */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.5 }}
                transition={{ duration: 0.5 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] ${scorer === 'player' ? 'bg-[#afff34]' : 'bg-red-600'}`}
            />

            {/* TEXTE PRINCIPAL */}
            <motion.h1 
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-8xl md:text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10 mb-8"
            >
                {t('game.goal')}
            </motion.h1>

            {/* SCORE BOARD */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-12 z-20 bg-black/20 px-12 py-6 rounded-3xl border border-white/10 shadow-2xl min-w-[300px]"
            >
                {/* JOUEUR */}
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[#afff34] font-black text-6xl drop-shadow-lg">{playerScore}</span>
                    <span className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2 whitespace-nowrap text-center">
                        {teamNames?.player || 'YOU'}
                    </span>
                </div>

                <div className="h-16 w-px bg-white/20"></div>

                {/* ADVERSAIRE */}
                <div className="flex flex-col items-center flex-1">
                    <span className="text-white font-black text-6xl drop-shadow-lg">{opponentScore}</span>
                    <span className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2 whitespace-nowrap text-center">
                        {teamNames?.opponent || 'OPP'}
                    </span>
                </div>
            </motion.div>

            {/* DETAILS BUTEUR */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col items-center z-10"
            >
                <div className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-xl shadow-xl border-2 ${scorer === 'player' ? 'bg-[#afff34] text-black border-white' : 'bg-red-600 text-white border-red-400'}`}>
                    {scorerName || 'Unknown'}
                </div>
                {reason && (
                    <span className="mt-3 text-white/80 text-sm font-medium bg-black/30 px-4 py-1.5 rounded-lg border border-white/5 text-center">
                        {getReasonText()}
                    </span>
                )}
            </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoalAnimation;
