import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/types';
import { useLanguage } from '@/app/LanguageContext'; 

interface MiniCardProps {
  data: Player;
  showBack: boolean;
  isInHand: boolean;
  teamColor: string;
  bonus: number;
  statusClasses: string; 
  shouldDim: boolean;
  onClick?: () => void;
}

const MiniCard: React.FC<MiniCardProps> = React.memo(({ 
  data, showBack, isInHand, teamColor, bonus, statusClasses, shouldDim, onClick 
}) => {
  const { t } = useLanguage();
  
  const getKeywordIcon = (keyword: string) => {
      if (!keyword) return null;
      if (keyword === "BOOST1" || keyword === "BOOST2") return "⚡";
      if (keyword === "AGRESSIF") return "💀";
      if (keyword === "POSSESSION") return "⭐";
      return null;
  };

  const bgGradient = 'bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#000]';
  const isDarkColor = teamColor === '#afff34' || teamColor === '#FEE11A' || teamColor === '#FFFFFF';
  const textColor = isDarkColor ? 'text-black' : 'text-white';

  return (
    <div className={`perspective-1000 w-full h-full cursor-pointer group rounded-xl`} onClick={onClick}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showBack ? 'flipped' : 'active'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, rotateY: showBack ? 180 : 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`relative w-full h-full rounded-xl flex flex-col border transition-all duration-500 bg-[#0a0a0a] shadow-xl ${statusClasses} group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden`}
        >
          {!showBack ? (
            <div className="flex flex-col w-full h-full relative rounded-xl overflow-hidden">
              {/* Sidebar Nom */}
              <div className="absolute top-0 bottom-0 right-0 border-l border-white/10 flex items-center justify-center z-20 min-w-[22px] bg-black/80 rounded-r-xl">
                <span className="font-black text-white/70 uppercase tracking-tighter text-[9px] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 drop-shadow-md">
                  {data.name}
                </span>
              </div>

              {/* VAEP & Bonus */}
              <div className="absolute top-1.5 left-2 z-20 flex items-start gap-1 drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                  <span className="font-black text-white text-4xl leading-none tracking-tighter">{data.vaep}</span>
                  {bonus > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className={`font-black ${textColor} text-[10px] px-1.5 py-0.5 rounded-md shadow-2xl mt-1 border border-white/20`} 
                        style={{ backgroundColor: teamColor }}
                    >
                      +{bonus}
                    </motion.span>
                  )}
              </div>

              {/* Corps de carte */}
              <div className={`flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden pt-2 pb-1 ${bgGradient}`}>
                  <div className="absolute rounded-full blur-[60px] opacity-25 w-32 h-32 -translate-y-4" style={{ backgroundColor: teamColor }}></div>
                  
                  <div className="relative z-10 mb-0.5 mt-auto self-start ml-2">
                     <span 
                        className={`font-black ${textColor} rounded px-2 py-0.5 flex items-center justify-center leading-none text-[10px] min-w-[2.2rem] shadow-xl border border-white/20`}
                        style={{ backgroundColor: teamColor }}
                     >
                       {data.pos}
                     </span>
                  </div>
              </div>

              {/* Pied de carte */}
              <div className="bg-black/80 backdrop-blur-sm flex flex-col justify-center shrink-0 h-7 px-1 border-t border-white/10 rounded-b-xl">
                  <div className="flex justify-center gap-2 h-full items-center mr-4">
                      {data.effects?.map((eff, i) => {
                        const icon = getKeywordIcon(eff);
                        if (!icon) return null;
                        return (
                            <span key={i} className="text-[13px] drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                                {icon}
                            </span>
                        );
                      })}
                  </div>
              </div>

              {shouldDim && <div className="absolute inset-0 bg-black/60 z-30 backdrop-grayscale-[0.5] rounded-xl" />}
            </div>
          ) : (
            <div 
              className="absolute inset-0 border-2 flex items-center justify-center overflow-hidden rounded-xl shadow-inner w-full h-full"
              style={{ 
                backgroundColor: teamColor,
                borderColor: 'rgba(255,255,255,0.15)',
                boxShadow: `inset 0 0 50px rgba(0,0,0,0.5)`
              }}
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default MiniCard;