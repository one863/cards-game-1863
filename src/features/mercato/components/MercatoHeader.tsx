import React from 'react';
import { useLanguage } from '../../../app/LanguageContext';
import { GAME_RULES } from '../../../core/rules/settings';
import { MdClose, MdFlashOn, MdPlayArrow, MdPeopleOutline, MdAttachMoney } from 'react-icons/md';

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
    <div className="flex flex-col gap-4 bg-slate-900 border-b border-white/10 p-4 sticky top-0 z-50 shadow-2xl">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-[#afff34] block rounded-full"></span>
            {t('mercato.title')}
         </h2>
         <button onClick={onBack} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <MdClose size={24} className="text-white/50 hover:text-white" />
         </button>
      </div>
      
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
            <MdAttachMoney /> {t('mercato.budget')}
          </span>
          <div className={`text-xl font-black ${currentCost > GAME_RULES.BUDGET_CAP ? 'text-red-500' : 'text-white'}`}>
            {currentCost}<span className="text-sm font-normal text-white/30 ml-1">/ {GAME_RULES.BUDGET_CAP}M</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
             {t('mercato.squad')} <MdPeopleOutline />
           </span>
           <div className={`text-xl font-black ${isReady ? 'text-[#afff34]' : 'text-white'}`}>
             {teamLength}<span className="text-sm font-normal text-white/30 ml-1">/ {GAME_RULES.DECK_SIZE}</span>
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
          <button 
            className="flex-1 py-3 px-4 bg-white/10 text-white font-bold text-xs uppercase rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2" 
            onClick={onAutoFill}
          >
            <MdFlashOn className="text-yellow-400" /> {t('mercato.auto')}
          </button>
          
          <button 
            className={`flex-[2] py-3 px-4 font-bold text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg
                ${isReady 
                    ? 'bg-[#afff34] text-black hover:bg-[#9ee020] shadow-[0_0_15px_rgba(175,255,52,0.3)]' 
                    : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
            onClick={onStartMatch} 
            disabled={!isReady}
          >
              {isReady ? <><MdPlayArrow size={16} /> {t('mercato.play')}</> : t('mercato.complete')}
          </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(f => (
              <button 
                key={f} 
                onClick={() => onFilterChange(f)} 
                className={`
                    px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border
                    ${filter === f 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'}
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
