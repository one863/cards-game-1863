import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';
import { MdCheckCircle, MdCancel, MdRefresh, MdHome } from 'react-icons/md';

interface MatchResultModalProps {
  winner: 'player' | 'opponent' | 'draw';
  playerScore: number;
  opponentScore: number;
  onRematch: () => void;
  onMenu: () => void;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ 
  winner, playerScore, opponentScore, onRematch, onMenu 
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
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
      >
        <motion.div 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
            
            {/* Icon */}
            <div className={`mb-6 text-6xl ${getColor()} drop-shadow-lg`}>
                {winner === 'player' && <MdCheckCircle />}
                {winner === 'opponent' && <MdCancel />}
                {winner === 'draw' && "⚖️"}
            </div>

            {/* Title */}
            <h1 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${getColor()}`}>
                {getTitle()}
            </h1>

            {/* Score */}
            <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-white">{playerScore}</span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">YOU</span>
                </div>
                <div className="h-12 w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-white">{opponentScore}</span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">OPP</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full relative z-10">
                <button 
                    onClick={onRematch}
                    className="w-full py-4 rounded-xl bg-[#afff34] text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#cfff70] active:scale-95 transition-all shadow-lg"
                >
                    <MdRefresh size={20} />
                    {t('game.replay')}
                </button>
                
                <button 
                    onClick={onMenu}
                    className="w-full py-4 rounded-xl bg-white/5 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
                >
                    <MdHome size={20} />
                    {t('game.cancel')}
                </button>
            </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchResultModal;
