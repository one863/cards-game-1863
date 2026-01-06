import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types'; // Corrigé (2 niveaux)
import { useLanguage } from '../../app/LanguageContext'; // Corrigé (2 niveaux)

interface LargeCardProps {
  data: Player;
  showBack: boolean;
  isMomentum: boolean;
  teamColor: string;
  statusClasses: string;
}

const LargeCard: React.FC<LargeCardProps> = React.memo(({ 
  data, showBack, isMomentum, teamColor, statusClasses
}) => {
  const { t } = useLanguage();

  const getKeywordIcon = (keyword: string) => {
      if (keyword.startsWith("BOOST")) return "⚡";
      if (keyword === "MENEUR") return "⭐";
      if (keyword === "AGRESSIF") return "💀";
      return "•";
  };

  const Silhouette = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-30">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );

  const isDarkColor = teamColor === '#afff34' || teamColor === '#FEE11A' || teamColor === '#FFFFFF';
  const textColor = isDarkColor ? 'text-black' : 'text-white';

  return (
    <div className="perspective-1000 w-full h-full">
        <motion.div
          key={showBack ? 'flipped' : 'active'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, rotateY: showBack ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col border-4 box-border transition-all duration-300 bg-[#0a0a0a] ${statusClasses}`}
        >
          {!showBack ? (
            <>
              <div className="flex justify-between items-center bg-black/40 px-6 h-14 border-b border-white/10 shrink-0 relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`font-black ${textColor} text-2xl px-2 py-0.5 rounded leading-none shadow-lg`} style={{ backgroundColor: teamColor }}>
                    {data.vaep}
                  </div>
                </div>
                <span className="font-black text-white text-xl uppercase tracking-tighter truncate max-w-[75%] drop-shadow-md">
                  {data.name}
                </span>
              </div>

              <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden pt-2 pb-1 bg-gradient-to-br from-[#111] to-[#050505]">
                  <div className="absolute rounded-full blur-3xl opacity-20 w-64 h-64" style={{ backgroundColor: teamColor }}></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12"><Silhouette /></div>
                  {isMomentum && <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl border border-white/20 z-50">MOMENTUM</div>}
              </div>

              <div className="bg-black/80 backdrop-blur-md flex flex-col justify-center shrink-0 p-4 gap-3 border-t border-white/10 relative z-10">
                 <div className="space-y-2">
                    <div className="flex flex-col border-l-4 pl-4 py-1.5 bg-white/5 rounded-r-lg" style={{ borderLeftColor: teamColor }}>
                       <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: teamColor }}>{t(`pos.${data.pos}`)}</span>
                       <span className="text-[11px] text-white/80 leading-tight font-medium">{t(`pos.${data.pos}_desc`)}</span>
                    </div>
                    {data.effects?.map((eff, i) => (
                      <div key={i} className="flex flex-col border-l-4 border-white/20 pl-4 py-1.5 bg-white/5 rounded-r-lg">
                         <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                           <span>{getKeywordIcon(eff)}</span>{t(`keywords.${eff}`)}
                         </span>
                         <span className="text-[11px] text-white/60 leading-tight font-medium italic">{t(`keywords.${eff}_desc`)}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#111]" style={{ backgroundColor: teamColor, boxShadow: `inset 0 0 100px rgba(0,0,0,0.6)` }}>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="absolute inset-4 border-2 border-white/20 rounded-xl opacity-50"></div>
            </div>
          )}
        </motion.div>
    </div>
  );
});

export default LargeCard;
