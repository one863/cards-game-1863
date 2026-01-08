import React from 'react';
import { useLanguage } from '@/app/LanguageContext';
import { GAME_RULES } from '@/core/rules/settings';
import { MdClose, MdFlashOn, MdPlayArrow, MdPeopleOutline, MdAttachMoney } from 'react-icons/md';
import { motion } from 'framer-motion';

interface MercatoHeaderProps {
  currentCost: number;
  teamLength: number;
  isReady: boolean;
  filter: string;
  onFilterChange: (filter: string) => void;
  onAutoFill: () => void;
  onStartMatch: () => void;
  onBack: () => void;
}

const MercatoHeader: React.FC<MercatoHeaderProps> = ({
  currentCost, teamLength, isReady, filter, onFilterChange, onAutoFill, onStartMatch, onBack
}) => {
  const { t } = useLanguage();
  const filters = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <div className="flex flex-col gap-5 bg-black/40 backdrop-blur-2xl border-b border-white/10 p-6 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
         <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#afff34] uppercase tracking-[4px] mb-1">TEAM BUILDER</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                {t('mercato.title')}
            </h2>
         </div>
         <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
            <MdClose size={24} className="text-white/70" />
         </button>
      </div>
      
      {/* Stats Bar - Expressive Style */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1 mb-1">
            {t('mercato.budget')}
          </span>
          <div className={`text-2xl font-black tabular-nums ${currentCost > GAME_RULES.BUDGET_CAP ? 'text-red-500' : 'text-white'}`}>
            {currentCost}<span className="text-xs font-bold text-white/20 ml-1">/ {GAME_RULES.BUDGET_CAP}M</span>
          </div>
        </div>
        <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner">
           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1 mb-1">
             {t('mercato.squad')}
           </span>
           <div className={`text-2xl font-black tabular-nums ${isReady ? 'text-[#afff34]' : 'text-white'}`}>
             {teamLength}<span className="text-xs font-bold text-white/20 ml-1">/ {GAME_RULES.DECK_SIZE}</span>
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2" 
            onClick={onAutoFill}
          >
            <MdFlashOn className="text-[#afff34]" size={18} /> {t('mercato.auto')}
          </motion.button>
          
          <motion.button 
            whileHover={isReady ? { scale: 1.02, y: -2 } : {}} whileTap={isReady ? { scale: 0.98 } : {}}
            className={`flex-[1.5] py-4 font-black text-xs uppercase tracking-[2px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xl
                ${isReady 
                    ? 'bg-[#afff34] text-black border-t border-white/40' 
                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
            onClick={onStartMatch} 
            disabled={!isReady}
          >
              {isReady ? <><MdPlayArrow size={20} /> {t('mercato.play')}</> : t('mercato.complete')}
          </motion.button>
      </div>

      {/* Filters - Minimalist Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(f => (
              <button 
                key={f} 
                onClick={() => onFilterChange(f)} 
                className={`
                    px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2
                    ${filter === f 
                        ? 'bg-white text-black border-white shadow-lg scale-105' 
                        : 'bg-transparent text-white/40 border-white/5 hover:border-white/20 hover:text-white'}
                `}
            >
                {f}
            </button>
          ))}
      </div>
    </div>
  );
};

export default MercatoHeader;
