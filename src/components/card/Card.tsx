import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../app/LanguageContext';
import { Player } from '../../types';

interface CardProps {
  data?: Player | null;
  isMomentum?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isAttacking?: boolean;
  hasActed?: boolean;
  bonus?: number;
  canBlock?: boolean;
  teamColor?: string;
  isLarge?: boolean;
  isInHand?: boolean; 
}

const Card: React.FC<CardProps> = ({ 
  data, isMomentum, isHidden, onClick, isSelected, isAttacking, hasActed, bonus = 0, canBlock, teamColor = '#333', isLarge = false, isInHand = false
}) => {
  const { t } = useLanguage();

  const showBack = isHidden || (isMomentum && !isLarge);

  const renderCardBack = () => (
    <div 
      className={`absolute inset-0 border-2 flex items-center justify-center overflow-hidden rounded-xl ${isLarge ? 'border-4' : 'border-2'}`}
      style={{ 
        backgroundColor: teamColor,
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.3)`
      }}
    >
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );

  if (isHidden && !isLarge) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all hover:brightness-110 cursor-pointer" onClick={onClick}>
        {renderCardBack()}
      </div>
    );
  }

  if (!data) return (
    <div className="w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center cursor-pointer" onClick={onClick}>
      <span className="text-white/10 text-2xl font-black">+</span>
    </div>
  );

  const getKeywordIcon = (keyword: string) => {
      if (keyword.startsWith("BOOST")) return "⚡";
      if (keyword === "MENEUR") return "⭐";
      if (keyword === "AGRESSIF") return "💀";
      return "•";
  };

  const Silhouette = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${isLarge ? 'opacity-30' : 'opacity-20'}`}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );

  let borderColor = isAttacking ? "#ff9f34" : isSelected ? "#afff34" : canBlock ? "#3b82f6" : "rgba(255,255,255,0.15)";
  let borderWidth = isAttacking || isSelected || canBlock ? (isLarge ? '6px' : '4px') : (isLarge ? '4px' : '1.5px');
  let shadow = isAttacking ? "0 0 40px rgba(255,159,52,0.6)" : isSelected ? "0 0 30px rgba(175,255,52,0.4)" : canBlock ? "0 0 25px rgba(59,130,246,0.4)" : "0 10px 20px rgba(0,0,0,0.5)";
  const shouldDim = hasActed && !isAttacking && !isSelected && !canBlock && !isLarge;

  return (
    <div className={`perspective-1000 w-full h-full ${isLarge ? '' : 'cursor-pointer'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showBack ? 'flipped' : 'active'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, rotateY: showBack ? 180 : 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onClick}
          className="relative w-full h-full rounded-xl overflow-hidden flex flex-col border transition-all duration-300"
          style={{ borderColor, borderWidth, boxShadow: shadow, backgroundColor: '#0a0a0a' }}
        >
          {!showBack ? (
            <>
              {/* EN-TÊTE */}
              {isLarge ? (
                <div className="flex justify-between items-center bg-black/40 px-6 h-14 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2"><div className="bg-[#afff34] text-black font-black text-2xl px-2 py-0.5 rounded leading-none">{data.vaep}</div></div>
                  <span className="font-black text-white text-xl uppercase tracking-tighter truncate max-w-[75%]">{data.name}</span>
                </div>
              ) : (
                <>
                  <div className={`absolute top-0 bottom-0 right-0 border-l border-white/10 flex items-center justify-center z-20 min-w-[20px] ${isInHand ? 'bg-[#222]' : 'bg-black/80'}`}>
                    <span className="font-black text-white/60 uppercase tracking-tighter text-[9px] whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{data.name}</span>
                  </div>
                  <div className="absolute top-1.5 left-2 z-20 flex items-start gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      <span className="font-black text-white text-3xl leading-none">{data.vaep}</span>
                      {bonus > 0 && <span className="font-black bg-[#afff34] text-black text-[10px] px-1.5 py-0.5 rounded shadow-lg mt-1">+{bonus}</span>}
                  </div>
                </>
              )}
              {/* CORPS */}
              <div className={`flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden pt-2 pb-1 ${isInHand && !isLarge ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]' : 'bg-gradient-to-br from-[#111] to-[#050505]'}`}>
                  <div className={`absolute rounded-full blur-3xl opacity-20 ${isLarge ? 'w-64 h-64' : 'w-24 h-24'}`} style={{ backgroundColor: teamColor }}></div>
                  {isLarge && <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12"><Silhouette /></div>}
                  {!isLarge && (
                    <div className="relative z-10 mb-0.5 mt-auto self-start ml-2">
                       <span className={`font-black text-black rounded px-1.5 flex items-center justify-center leading-none text-[9px] h-4 min-w-[2rem] shadow-lg border border-black/10 ${isInHand ? 'bg-white/70' : 'bg-[#afff34]'}`}>{data.pos}</span>
                    </div>
                  )}
                  {isLarge && isMomentum && <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl border border-white/20 z-50">MOMENTUM</div>}
              </div>
              {/* CAPACITÉS */}
              <div className={`bg-black/60 flex flex-col justify-center shrink-0 ${isLarge ? 'p-4 gap-3' : 'h-6 px-1 border-t border-white/5'}`}>
                  {isLarge ? (
                    <div className="space-y-2">
                       <div className="flex flex-col border-l-4 border-[#afff34] pl-4 py-1.5 bg-white/5 rounded-r-lg">
                          <span className="text-[11px] font-black text-[#afff34] uppercase tracking-widest">{t(`pos.${data.pos}`)}</span>
                          <span className="text-[11px] text-white/70 leading-tight font-medium">{t(`pos.${data.pos}_desc`)}</span>
                       </div>
                       {data.effects?.map((eff, i) => (
                         <div key={i} className="flex flex-col border-l-4 border-white/20 pl-4 py-1.5 bg-white/5 rounded-r-lg">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2"><span>{getKeywordIcon(eff)}</span>{t(`keywords.${eff}`)}</span>
                            <span className="text-[11px] text-white/50 leading-tight font-medium italic">{t(`keywords.${eff}_desc`)}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="flex justify-center gap-1.5 h-full items-center mr-2">
                        {data.effects?.map((eff, i) => <span key={i} className="text-[10px] opacity-60">{getKeywordIcon(eff)}</span>)}
                    </div>
                  )}
              </div>
              {shouldDim && <div className="absolute inset-0 bg-black/70 z-30 backdrop-grayscale" />}
            </>
          ) : (
            renderCardBack()
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Card;
