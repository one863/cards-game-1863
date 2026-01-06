import React from 'react';
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { useLanguage } from '../../../app/LanguageContext';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: { teamName: string; score: number };
  opponent: { teamName: string; score: number };
  goals: any[];
}

const StatsModal: React.FC<StatsModalProps> = ({ 
  isOpen, 
  onClose, 
  player, 
  opponent, 
  goals 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }} 
      animate={{ y: 0 }} 
      exit={{ y: '100%' }} 
      transition={{ type: 'spring', damping: 25 }} 
      className="absolute inset-0 bg-[#080808] z-[120] flex flex-col"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center pt-10">
        <h2 className="text-[#afff34] font-black uppercase tracking-widest text-sm">{t('game.match_stats')}</h2>
        <button onClick={onClose} className="text-[#444] hover:text-white">
          <MdClose size={28} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center items-center gap-8 mb-8 bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="text-center w-1/3">
                  <div className="text-xs text-[#888] font-black uppercase mb-2 tracking-widest">{t(player.teamName)}</div>
                  <div className="text-5xl font-black text-[#afff34]">{player.score}</div>
              </div>
              <div className="text-2xl text-[#333] font-thin">:</div>
              <div className="text-center w-1/3">
                  <div className="text-xs text-[#888] font-black uppercase mb-2 tracking-widest">{t(opponent.teamName)}</div>
                  <div className="text-5xl font-black text-red-500">{opponent.score}</div>
              </div>
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 px-2 border-l-2 border-[#afff34]">{t('game.scorers')}</h3>
          <div className="space-y-2">
              {goals && goals.length > 0 ? (
                  goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                          <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${goal.scorerSide === 'player' ? 'bg-[#afff34]' : 'bg-red-500'}`}></div>
                              <span className={`font-black uppercase tracking-tight ${goal.scorerSide === 'player' ? 'text-white' : 'text-white/70'}`}>
                                  {goal.scorerName}
                              </span>
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#666] font-mono font-bold">
                                  {new Date(goal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[9px] text-[#444] uppercase tracking-wide">
                                  {goal.reason}
                              </span>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center text-white/30 italic py-8 text-xs">
                      {t('game.no_goals')}
                  </div>
              )}
          </div>
      </div>
    </motion.div>
  );
};

export default StatsModal;