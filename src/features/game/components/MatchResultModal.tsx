import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';
import { MdCheckCircle, MdCancel, MdRefresh, MdHome, MdVisibility } from 'react-icons/md';

interface MatchResultModalProps {
  winner: 'player' | 'opponent' | 'draw';
  playerScore: number;
  opponentScore: number;
  playerTeamName?: string;
  opponentTeamName?: string;
  onRematch: () => void;
  onMenu: () => void;
  onReview?: () => void;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ 
  winner, playerScore, opponentScore, playerTeamName, opponentTeamName, onRematch, onMenu, onReview 
}) => {
  const { t } = useLanguage();

  const getTitle = () => {
      if (winner === 'player') return t('game.win');
      if (winner === 'opponent') return t('game.lose');
      return t('game.draw');
  };

  const getColor = () => {
      if (winner === 'player') return 'text-[#afff34]';
      if (winner === 'opponent') return 'text-red-500';
      return 'text-white';
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-3xl px-4"
      >
        <motion.div 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-[340px] flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
            
            <div className={`mb-6 text-6xl ${getColor()} drop-shadow-lg`}>
                {winner === 'player' && <MdCheckCircle />}
                {winner === 'opponent' && <MdCancel />}
                {winner === 'draw' && "⚖️"}
            </div>

            <h1 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-6 text-center ${getColor()}`}>
                {getTitle()}
            </h1>

            <div className="flex items-center justify-between w-full mb-8 px-2 gap-4">
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <span className="text-4xl md:text-5xl font-black text-white">{playerScore}</span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 truncate w-full text-center">
                        {playerTeamName ? t(playerTeamName) : t('selection.you')}
                    </span>
                </div>
                
                <div className="h-12 w-px bg-white/10 shrink-0"></div>
                
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <span className="text-4xl md:text-5xl font-black text-white">{opponentScore}</span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 truncate w-full text-center">
                        {opponentTeamName ? t(opponentTeamName) : t('selection.opponent')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full relative z-10">
                <button 
                    onClick={onRematch}
                    className="w-full py-4 rounded-xl bg-[#afff34] text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#cfff70] active:scale-95 transition-all shadow-lg text-sm"
                >
                    <MdRefresh size={20} />
                    {t('game.replay')}
                </button>
                
                {onReview && (
                    <button 
                        onClick={onReview}
                        className="w-full py-4 rounded-xl bg-white/5 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all border border-white/10 text-sm"
                    >
                        <MdVisibility size={20} />
                        {t('game.view_match')}
                    </button>
                )}

                <button 
                    onClick={onMenu}
                    className="w-full py-3 rounded-xl bg-white/5 text-white/40 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all border border-white/5 text-[10px]"
                >
                    <MdHome size={18} />
                    {t('game.cancel')}
                </button>
            </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchResultModal;