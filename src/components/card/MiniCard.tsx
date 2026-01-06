import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types';
import { useLanguage } from '../../app/LanguageContext'; 

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
      if (keyword.startsWith("BOOST")) return "⚡";
      if (keyword === "MENEUR") return "⭐";
      if (keyword === "AGRESSIF") return "💀";
      return "•";
  };

  const bgGradient = isInHand 
    ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]' 
    : 'bg-gradient-to-br from-[#111] to-[#050505]';

  const uiColor = teamColor;
  const isDarkColor = teamColor === '#afff34' || teamColor === '#FEE11A' || teamColor === '#FFFFFF';
  const textColor = isDarkColor ? 'text-black' : 'text-white';

  return (
    <div className={`perspective-1000 w-full h-full cursor-pointer`} onClick={onClick}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showBack ? 'flipped' : 'active'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, rotateY: showBack ? 180 : 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`relative w-full h-full rounded-xl overflow-hidden flex flex-col border transition-all duration-300 bg-[#0a0a0a] ${statusClasses}`}
        >
          {!showBack ? (
            <>
              <div className={`absolute top-0 bottom-0 right-0 border-l border-white/10 flex items-center justify-center z-20 min-w-[20px] ${isInHand ? 'bg-[#222]' : 'bg-black/80'}`}>
                <span className="font-black text-white/60 uppercase tracking-tighter text-[9px] whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                  {data.name}
                </span>
              </div>

              <div className="absolute top-1.5 left-2 z-20 flex items-start gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <span className="font-black text-white text-3xl leading-none">{data.vaep}</span>
                  {bonus > 0 && (
                    <span className={`font-black ${textColor} text-[10px] px-1.5 py-0.5 rounded shadow-lg mt-1`} style={{ backgroundColor: uiColor }}>
                      +{bonus}
                    </span>
                  )}
              </div>

              <div className={`flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden pt-2 pb-1 ${bgGradient}`}>
                  <div className="absolute rounded-full blur-3xl opacity-20 w-24 h-24" style={{ backgroundColor: teamColor }}></div>
                  
                  <div className="relative z-10 mb-0.5 mt-auto self-start ml-2">
                     <span 
                        className={`font-black ${textColor} rounded px-1.5 flex items-center justify-center leading-none text-[9px] h-4 min-w-[2rem] shadow-lg border border-black/10`}
                        style={{ backgroundColor: isInHand ? 'rgba(255,255,255,0.7)' : uiColor }}
                     >
                       {data.pos}
                     </span>
                  </div>
              </div>

              <div className="bg-black/60 flex flex-col justify-center shrink-0 h-6 px-1 border-t border-white/5">
                  <div className="flex justify-center gap-1.5 h-full items-center mr-2">
                      {data.effects?.map((eff, i) => (
                        <span key={i} className="text-[10px] opacity-60">{getKeywordIcon(eff)}</span>
                      ))}
                  </div>
              </div>

              {shouldDim && <div className="absolute inset-0 bg-black/70 z-30 backdrop-grayscale" />}
            </>
          ) : (
            <div 
              className="absolute inset-0 border-2 flex items-center justify-center overflow-hidden rounded-xl"
              style={{ 
                backgroundColor: teamColor,
                borderColor: 'rgba(255,255,255,0.1)',
                boxShadow: `inset 0 0 40px rgba(0,0,0,0.3)`
              }}
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default MiniCard;
