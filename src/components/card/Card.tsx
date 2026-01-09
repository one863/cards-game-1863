import React, { useMemo } from 'react';
import { Player } from '@/types';
import MiniCard from './MiniCard';
import LargeCard from './LargeCard';
import { THEME } from '@/styles/theme';

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

  const statusClasses = useMemo(() => {
    let classes = "";
    if (isAttacking) classes += " border-[#ff9f34] shadow-[0_0_40px_rgba(255,159,52,0.6)]";
    else if (isSelected) classes += ` border-[${THEME.colors.player}] shadow-[0_0_30px_rgba(175,255,52,0.4)]`;
    else if (canBlock) classes += " border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)]";
    else classes += " border-white/10 shadow-lg";
    
    if (isAttacking || isSelected || canBlock) classes += isLarge ? " border-[6px]" : " border-[3px]";
    else classes += isLarge ? " border-[4px]" : " border-[1.5px]";

    return classes;
  }, [isAttacking, isSelected, canBlock, isLarge]);

  const showBack = isHidden || (isMomentum && !isLarge);
  const shouldDim = !!hasActed && !isAttacking && !isSelected && !canBlock && !isLarge;

  if (!data && !isHidden) {
    return (
      <div className="w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center cursor-pointer" onClick={onClick}>
        <span className="text-white/10 text-2xl font-black">+</span>
      </div>
    );
  }

  // Sécurité sur les données de la carte (fallback vers un objet vide valide)
  const safeData: Player = data || {
      id: 'unknown',
      name: 'Unknown',
      fullName: 'Unknown Player',
      pos: 'ST',
      nat: '??',
      vaep: 0,
      rating: 0,
      cost: 0,
      effects: []
  };

  if (isLarge) {
    return (
      <LargeCard 
        data={safeData}
        showBack={!!showBack}
        isMomentum={!!isMomentum}
        teamColor={teamColor}
        statusClasses={statusClasses}
      />
    );
  }

  return (
    <MiniCard 
      data={safeData}
      showBack={!!showBack}
      isInHand={isInHand}
      teamColor={teamColor}
      bonus={bonus}
      statusClasses={statusClasses}
      shouldDim={shouldDim}
      onClick={onClick}
    />
  );
};

export default React.memo(Card);