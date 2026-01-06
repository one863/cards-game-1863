import React from 'react';
import { motion } from 'framer-motion';
import { MdLayers, MdDeleteSweep } from 'react-icons/md';
import { GameSide } from '../../../types';
import { useLanguage } from '../../../app/LanguageContext';

interface GameHUDProps {
  side: GameSide;
  sideKey: 'player' | 'opponent';
  isCurrentTurn: boolean;
}

const GameHUD: React.FC<GameHUDProps> = ({ side, sideKey, isCurrentTurn }) => {
  const { t } = useLanguage();
  const isPlayer = sideKey === 'player';
  const accentColor = isPlayer ? 'text-[#afff34]' : 'text-red-500';
  const borderColor = isCurrentTurn ? (isPlayer ? 'border-[#afff34]' : 'border-red-500') : 'border-white/10';
  const bgOpacity = isCurrentTurn ? 'bg-black/95' : 'bg-black/85';

  return (
    <motion.div layout className={`w-full flex items-center justify-between px-10 h-12 shrink-0 ${bgOpacity} backdrop-blur-md border-y transition-all duration-300 ${borderColor} ${isCurrentTurn ? (isPlayer ? 'shadow-[0_0_30px_rgba(175,255,52,0.15)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.15)]') : ''} z-20`}>
      <div className="flex items-center gap-4 min-w-[120px]">
          <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${accentColor}`}>
            {t(side.teamName)}
          </span>
          {isCurrentTurn && <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className={`w-1.5 h-1.5 rounded-full ${isPlayer ? 'bg-[#afff34]' : 'bg-red-500'}`} />}
      </div>
      <div className="flex flex-col items-center">
           <div className="flex items-center gap-6">
              <span className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${isPlayer ? 'text-[#afff34]' : 'text-white'}`}>{side.score}</span>
           </div>
      </div>
      <div className="flex items-center gap-6 min-w-[140px] justify-end">
          {/* Deck Count - Agrandissement icône et texte */}
          <div className="flex items-center gap-2">
            <MdLayers className={`${accentColor} opacity-50`} size={18} />
            <span className="text-sm md:text-base font-mono font-black text-white/90 leading-none">
              {side.deck.length}
            </span>
          </div>
          
          {/* Discard Count - Agrandissement icône et texte */}
          <div className="flex items-center gap-2">
            <MdDeleteSweep className="text-gray-500" size={20} />
            <span className="text-sm md:text-base font-mono font-black text-gray-500 leading-none">
              {side.discard.length}
            </span>
          </div>
      </div>
    </motion.div>
  );
};

export default GameHUD;
