// src/components/ui/GoalAnimation.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../app/LanguageContext';

interface GoalAnimationProps {
  type: 'goal' | 'GAME_OVER';
  scorer?: 'player' | 'opponent';
  scorerName?: string;
  reason?: string;
  winner?: 'player' | 'opponent' | 'draw' | null;
  playerScore?: number;
  opponentScore?: number;
  teamNames?: { player: string, opponent: string };
  onBackToMenu: () => void;
  onViewLogs?: () => void;
}

const GoalAnimation: React.FC<GoalAnimationProps> = ({ 
  type, scorer, scorerName, reason, winner, playerScore, opponentScore, teamNames, onBackToMenu 
}) => {
  const { t } = useLanguage();
  const playerTeamName = teamNames?.player || t('selection.you');
  const opponentTeamName = teamNames?.opponent || t('selection.opponent');

  if (type === 'GAME_OVER') {
    const isWin = winner === 'player';
    const isDraw = winner === 'draw';
    const titleColor = isWin ? 'text-[#afff34]' : (isDraw ? 'text-white' : 'text-red-500');
    const titleText = isWin ? t('game.win') : (isDraw ? t('game.draw') : t('game.lose'));

    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
      >
        <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl font-black uppercase tracking-tighter mb-8 ${titleColor} drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
        >
          {titleText}
        </motion.h1>

        <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
                <div className="text-[10px] font-black text-[#888] uppercase mb-2 tracking-widest">{opponentTeamName}</div>
                <div className="text-6xl font-black text-white">{opponentScore}</div>
            </div>
            <div className="text-4xl text-[#333] font-thin">:</div>
            <div className="text-center">
                <div className="text-[10px] font-black text-[#888] uppercase mb-2 tracking-widest">{playerTeamName}</div>
                <div className="text-6xl font-black text-[#afff34]">{playerScore}</div>
            </div>
        </div>

        <div className="text-white/50 text-lg font-bold italic mb-8">
          {reason && (reason.startsWith('game.') || reason.startsWith('logs.')) ? t(reason) : reason}
        </div>
        
        <button onClick={onBackToMenu} className="px-8 py-3 bg-[#afff34] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
           {t('game.continue')}
        </button>
      </motion.div>
    );
  }

  const isPlayer = scorer === 'player';
  const colorClass = isPlayer ? 'text-[#afff34]' : 'text-red-500';
  const borderColor = isPlayer ? 'border-[#afff34]' : 'border-red-500';

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
    >
        <motion.div 
            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }}
            className={`w-[90%] max-w-sm p-8 bg-black/90 rounded-3xl flex flex-col items-center justify-center border-4 ${borderColor} shadow-[0_0_50px_rgba(0,0,0,0.8)]`}
        >
          <motion.h1 
            animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
            className={`${colorClass} text-7xl font-black uppercase tracking-tighter m-0 drop-shadow-[0_0_20px_rgba(0,0,0,1)] italic`}
          >
            {t('game.goal')}!
          </motion.h1>
          
          <div className="text-2xl font-black text-white mt-4 uppercase text-center tracking-wide">
            {scorerName}
          </div>

          <div className="flex items-center gap-4 mt-6 px-6 py-2 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-white/30 uppercase leading-none mb-1 tracking-widest">{playerTeamName}</span>
                  <span className="text-3xl font-black text-[#afff34]">{playerScore}</span>
              </div>
              <div className="text-xl font-bold text-white/20">-</div>
              <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-white/30 uppercase leading-none mb-1 tracking-widest">{opponentTeamName}</span>
                  <span className="text-3xl font-black text-red-500">{opponentScore}</span>
              </div>
          </div>
          
          {reason && (
            <div className={`mt-4 px-4 py-1 rounded-full text-black font-bold text-xs uppercase tracking-wider ${isPlayer ? 'bg-[#afff34]' : 'bg-red-500'}`}>
                {reason && (reason.startsWith('game.') || reason.startsWith('logs.')) ? t(reason) : reason}
            </div>
          )}
          
          <button onClick={onBackToMenu} className="mt-8 px-6 py-2 bg-white/10 border border-white/20 text-white font-bold uppercase rounded-full hover:bg-white/20 transition-colors">
              {t('game.continue')}
          </button>
        </motion.div>
    </motion.div>
  );
};

export default GoalAnimation;
