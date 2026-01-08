import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/card/Card';
import { Player } from '@/types';

interface GameHandProps {
  hand: Player[];
  sideKey: 'player' | 'opponent';
  selectedBoostId: string | null;
  deckCount: number;
  discardCount: number;
  onCardClick: (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => void;
  onDeckClick?: () => void;
  onDiscardClick?: () => void;
  onDragStart?: (event: React.DragEvent, card: Player, cardIndex: number) => void;
}

const GameHand: React.FC<GameHandProps> = ({
  hand, sideKey, selectedBoostId, deckCount, discardCount,
  onCardClick, onDeckClick, onDiscardClick, onDragStart
}) => {
  const isPlayer = sideKey === 'player';
  const teamColor = isPlayer ? '#afff34' : '#ef4444';

  const InfoSlot = () => (
    <div className="w-full aspect-[3/4] flex flex-col gap-1 justify-center shrink-0">
        <button
            onClick={onDeckClick}
            disabled={!isPlayer}
            className={`flex-1 border rounded-xl flex flex-col items-center justify-center transition-all ${isPlayer ? 'bg-black/40 border-white/10 hover:border-[#afff34]/50 shadow-lg' : 'bg-black/20 border-white/5 opacity-50'}`}
        >
            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter leading-none mb-1">DECK</span>
            <span className="text-[12px] font-black text-white leading-none">{deckCount}</span>
        </button>
        <button
            onClick={onDiscardClick}
            disabled={!isPlayer}
            className={`flex-1 border rounded-xl flex flex-col items-center justify-center transition-all ${isPlayer ? 'bg-black/40 border-white/10 hover:border-red-500/50 shadow-lg' : 'bg-black/20 border-white/5 opacity-50'}`}
        >
            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter leading-none mb-1">DISC</span>
            <span className="text-[12px] font-black text-white/70 leading-none">{discardCount}</span>
        </button>
    </div>
  );

  return (
    <div className={`w-full max-w-[450px] px-4 mx-auto overflow-visible h-[110px] flex items-center justify-center`}>
        <div className={`grid grid-cols-5 gap-2 w-full overflow-visible ${isPlayer ? 'items-start' : 'items-end'}`}>

            {isPlayer ? (
                <>
                    {hand.map((card, i) => (
                        <motion.div
                            key={card.instanceId || i}
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                            className="relative w-full aspect-[3/4] hover:scale-110 hover:z-50 transition-transform duration-200 shadow-2xl origin-top"
                            draggable={onDragStart ? true : false} onDragStart={onDragStart ? (e) => onDragStart(e, card, i) : undefined}
                        >
                            <Card data={card} isSelected={selectedBoostId === card.instanceId} onClick={() => onCardClick(card, sideKey, 'hand', i)} teamColor={teamColor} isInHand={true} />
                        </motion.div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - hand.length) }).map((_, i) => (
                        <div key={`e-${i}`} className="w-full aspect-[3/4] bg-black/10 rounded-xl flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                        </div>
                    ))}
                    <InfoSlot />
                </>
            ) : (
                <>
                    <InfoSlot />
                    {Array.from({ length: Math.max(0, 4 - hand.length) }).map((_, i) => (
                        <div key={`e-${i}`} className="w-full aspect-[3/4] bg-black/10 rounded-xl flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                        </div>
                    ))}
                    {hand.map((card, i) => (
                        <div key={card.instanceId || i} className="relative w-full aspect-[3/4] opacity-50">
                            <Card isHidden={true} teamColor={teamColor} />
                        </div>
                    ))}
                </>
            )}
        </div>
    </div>
  );
};

export default GameHand;