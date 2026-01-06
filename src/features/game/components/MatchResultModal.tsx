import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdReplay, MdGroups, MdRemoveRedEye } from 'react-icons/md';
import { useLanguage } from '../../../app/LanguageContext';
import { GameSide } from '../../../types';

interface MatchResultModalProps {
  winner: 'player' | 'opponent' | 'draw';
  player: GameSide;
  opponent: GameSide;
  onRestart: () => void;
  onQuit: () => void;
  onClose: () => void;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ 
  winner, player, opponent, onRestart, onQuit, onClose 
}) => {
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6"
    >
        <motion.div 
          initial={{ scale: 0.8, y: 50 }} 
          animate={{ scale: 1, y: 0 }} 
          className="bg-[#111] border-2 border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 max-w-md w-full relative"
        >
            <div className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {winner === 'player' ? '🏆' : winner === 'opponent' ? '💀' : '🤝'}
            </div>
            
            <h2 className="text-4xl font-black uppercase tracking-tighter text-center">
                {winner === 'player' ? t('game.win') : winner === 'opponent' ? t('game.lose') : t('game.draw')}
            </h2>
            
            <div className="flex items-center gap-8 text-3xl font-black mb-4">
                <div className="flex flex-col items-center">
                    <span className="text-[#666] text-[10px] uppercase tracking-widest mb-1">
                        {t(player.teamName)}
                    </span>
                    <span className="text-[#afff34]">{player.score}</span>
                </div>
                <span className="text-[#333]">-</span>
                <div className="flex flex-col items-center">
                    <span className="text-[#666] text-[10px] uppercase tracking-widest mb-1">
                        {t(opponent.teamName)}
                    </span>
                    <span className="text-white">{opponent.score}</span>
                </div>
            </div>
            
            <div className="w-full flex flex-col gap-3">
                {/* 1. REJOUER LE MATCH */}
                <button 
                    onClick={onRestart} 
                    className="w-full bg-[#afff34] text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#9fef00] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                >
                    <MdReplay size={24} /> {t('game.replay')}
                </button>
                
                {/* 2. REVOIR LE MATCH */}
                <button 
                    onClick={onClose} 
                    className="w-full bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/5"
                >
                    <MdRemoveRedEye size={24} /> {t('game.view_match')}
                </button>

                {/* 3. CHANGER D'ÉQUIPES */}
                <button 
                    onClick={onQuit} 
                    className="w-full bg-white/5 text-white/60 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/5"
                >
                    <MdGroups size={24} /> {t('game.change_teams')}
                </button>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default MatchResultModal;
