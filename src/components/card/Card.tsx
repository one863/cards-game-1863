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
  isDeckSelected?: boolean;
  isAttacking?: boolean;
  hasActed?: boolean;
  bonus?: number;
  canBlock?: boolean;
  teamColor?: string;
  isLarge?: boolean;
  isInHand?: boolean; 
}

const Card: React.FC<CardProps> = ({ 
  data, isMomentum, isHidden, onClick, isSelected, isDeckSelected, isAttacking, hasActed, bonus = 0, canBlock, teamColor = '#333', isLarge = false, isInHand = false
}) => {
  const { t } = useLanguage();

  const renderCardBack = () => {
    // Style spécifique pour les cartes en main cachées (Adversaire)
    if (isHidden) {
        return (
            <div 
              className={`absolute inset-0 border-2 flex items-center justify-center overflow-hidden rounded-xl ${isLarge ? 'border-4' : 'border-2'}`}
              style={{ 
                backgroundColor: '#141414',
                borderColor: teamColor,
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.5)`
              }}
            >
              {/* Pattern géométrique simple pour le dos des cartes en main */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `radial-gradient(${teamColor} 1px, transparent 1px)`,
                    backgroundSize: '10px 10px'
                }}
              ></div>
              
              <div className="flex flex-col items-center justify-center relative z-10">
                 <div className="text-2xl font-black text-white/10 tracking-[0.2em] border-2 border-white/5 px-2 py-1">
                    863
                 </div>
              </div>
            </div>
        );
    }

    // Style pour les cartes MOMENTUM (Retournées sur le terrain)
    return (
      <div 
        className={`absolute inset-0 border-2 flex items-center justify-center overflow-hidden rounded-xl ${isLarge ? 'border-4' : 'border-2'}`}
        style={{ 
          backgroundColor: '#050505',
          borderColor: isMomentum ? '#333' : teamColor, // Bordure plus sombre pour Momentum
          boxShadow: `inset 0 0 30px ${teamColor}20`
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        {/* Rayures de danger pour Momentum */}
        {isMomentum && (
            <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#afff34_10px,#afff34_20px)]"></div>
        )}

        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className={`${isLarge ? 'text-9xl' : 'text-4xl'} font-black italic text-white/5 select-none`}>
              ONE863
          </div>
          {isMomentum && (
             <motion.div 
               animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="text-[#afff34] text-[10px] font-black uppercase tracking-[0.2em] bg-black/80 px-3 py-1 rounded border border-[#afff34]/20"
             >
               MOMENTUM
             </motion.div>
          )}
        </div>
      </div>
    );
  };

  if (isHidden) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all hover:brightness-125 cursor-pointer" onClick={onClick}>
        {renderCardBack()}
      </div>
    );
  }

  if (!data) return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
      onClick={onClick}
    >
      <span className="text-white/20 text-2xl font-black">+</span>
    </motion.div>
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

  // LOGIQUE DE COULEUR ET BORDURE 🔥
  let containerClass = "relative w-full h-full rounded-xl overflow-hidden transition-all duration-300 border flex flex-col";
  
  if (isInHand && !isLarge) {
      containerClass += " hover:-translate-y-2 hover:z-20 shadow-lg";
  }

  let borderColor = isAttacking ? "#ff9f34" : isSelected ? "#afff34" : canBlock ? "#3b82f6" : "rgba(255,255,255,0.1)";
  
  if (isInHand && !isSelected && !isLarge) {
      borderColor = "rgba(255,255,255,0.15)";
  }

  let borderWidth = isAttacking || isSelected || canBlock ? (isLarge ? '6px' : '4px') : (isLarge ? '4px' : '1px');
  let shadow = isAttacking ? "0 0 40px rgba(255,159,52,0.6)" : isSelected ? "0 0 30px rgba(175,255,52,0.4)" : canBlock ? "0 0 25px rgba(59,130,246,0.4)" : "0 10px 20px rgba(0,0,0,0.5)";

  const shouldDim = hasActed && !isAttacking && !isSelected && !canBlock && !isLarge;

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, opacity: 1,
      rotateY: isMomentum ? 180 : 0,
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    },
    exit: { scale: 0.8, opacity: 0 }
  };

  return (
    <div className={`perspective-1000 w-full h-full ${isLarge ? '' : 'cursor-pointer'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isMomentum ? 'flipped' : 'active'}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          onClick={onClick}
          className={containerClass}
          style={{ 
            borderColor, 
            borderWidth,
            boxShadow: shadow,
            backgroundColor: isInHand && !isLarge ? '#1a1a1a' : '#0a0a0a' 
          }}
        >
          {!isMomentum ? (
            <>
              {/* --- EN-TÊTE --- */}
              {isLarge ? (
                <div className="flex justify-between items-center bg-black/40 px-6 h-14 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#afff34] text-black font-black text-2xl px-2 py-0.5 rounded leading-none">
                      {data.vaep}
                    </div>
                  </div>
                  <span className="font-black text-white text-2xl uppercase tracking-tighter truncate max-w-[70%]">
                    {data.name}
                  </span>
                </div>
              ) : (
                <>
                  {/* Vertical Name Tab */}
                  <div className={`absolute top-0 bottom-0 right-0 border-l border-white/20 flex items-center justify-center z-20 shadow-lg min-w-[20px] ${isInHand ? 'bg-[#333]' : 'bg-black/90'}`}>
                    <span className="font-black text-white uppercase tracking-tighter text-[10px] whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                      {data.name}
                    </span>
                  </div>
                  
                  {/* VAEP Display (Mini only) */}
                  <div className="absolute top-1.5 left-2 z-20 flex items-start gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none">
                      <span className="font-black text-white text-3xl leading-none">{data.vaep}</span>
                      {bonus > 0 && (
                            <span className="font-black bg-[#afff34] text-black text-xs px-1.5 py-0.5 rounded-md shadow-lg border border-black/20 mt-1">
                              +{bonus}
                            </span>
                      )}
                  </div>
                </>
              )}

              {/* --- CORPS DE CARTE --- */}
              <div className={`flex-1 min-h-0 relative flex flex-col items-center justify-between overflow-hidden pt-2 pb-1 ${isInHand && !isLarge ? 'bg-gradient-to-br from-[#222] to-[#111]' : 'bg-gradient-to-br from-[#111] to-[#050505]'}`}>
                  {/* Halo d'équipe */}
                  <div className={`absolute rounded-full blur-3xl opacity-30 ${isLarge ? 'w-64 h-64' : 'w-24 h-24'}`} style={{ backgroundColor: teamColor }}></div>
                  
                  {/* Motif de fond (Différenciation Main/Terrain) */}
                  {isInHand && !isLarge && (
                      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
                  )}

                  {isLarge && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                        <Silhouette />
                    </div>
                  )}

                  {/* Position Badge (Mini only) */}
                  {!isLarge && (
                    <div className="relative z-10 mb-0.5 mt-auto self-start ml-2">
                       <span className={`font-black text-black rounded px-1.5 flex items-center justify-center leading-none text-[10px] h-4 min-w-[2rem] shadow-lg border border-black/10 ${isInHand ? 'bg-white/90' : 'bg-[#afff34]'}`}>
                         {data.pos}
                       </span>
                    </div>
                  )}

                  {isLarge && bonus > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute z-30 font-black bg-green-500 text-black flex items-center justify-center rounded-lg border-2 border-black shadow-xl bottom-4 right-4 text-4xl w-16 h-16"
                    >
                      +{bonus}
                    </motion.div>
                  )}
              </div>

              {/* --- CAPACITÉS (Bas de carte) --- */}
              <div className={`bg-black/60 flex flex-col justify-center shrink-0 ${isLarge ? 'p-4 gap-3' : 'h-6 px-1 border-t border-white/5'}`}>
                  {isLarge ? (
                    <div className="space-y-2 overflow-hidden">
                       <div className="flex flex-col border-l-4 border-[#afff34] pl-4 py-1.5 bg-white/5 rounded-r-lg border-y border-r border-white/5">
                          <span className="text-[11px] font-black text-[#afff34] uppercase tracking-widest">{t(`pos.${data.pos}`)}</span>
                          <span className="text-[11px] text-white/70 leading-tight font-medium">{t(`pos.${data.pos}_desc`)}</span>
                       </div>
                       {data.effects?.map((eff, i) => (
                         <div key={i} className="flex flex-col border-l-4 border-white/20 pl-4 py-1.5 bg-white/5 rounded-r-lg border-y border-r border-white/5">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                              <span>{getKeywordIcon(eff)}</span>
                              {t(`keywords.${eff}`)}
                            </span>
                            <span className="text-[11px] text-white/50 leading-tight font-medium italic">{t(`keywords.${eff}_desc`)}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="flex justify-center gap-1.5 h-full items-center mr-2">
                        {data.effects?.map((eff, i) => (
                          <span key={i} className="text-[10px]" title={t(`keywords.${eff}`)}>
                            {getKeywordIcon(eff)}
                          </span>
                        ))}
                    </div>
                  )}

                  {isLarge && (
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center opacity-20">
                        <span className="text-[8px] font-black tracking-[0.4em]">ONE863 TACTICAL</span>
                        <span className="text-[8px] font-black">V1.0.7</span>
                    </div>
                  )}
              </div>

              {/* Overlay de fatigue/action utilisée */}
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
