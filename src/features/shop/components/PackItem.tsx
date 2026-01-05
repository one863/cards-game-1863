import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../app/LanguageContext';
import { MdAttachMoney } from 'react-icons/md';

interface PackItemProps {
  pack: {
    id: string;
    name: string;
    cost: number;
    cardCount: number;
    guaranteed: string;
    color: string;
  };
  onBuy: (id: string) => void;
  disabled: boolean;
}

const PackItem: React.FC<PackItemProps> = ({ pack, onBuy, disabled }) => {
  const { t } = useLanguage();
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 group"
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30" 
        style={{ background: `linear-gradient(to bottom right, ${pack.color}, transparent)` }} 
      />
      
      <div className="relative p-5 flex flex-col h-full justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white" style={{ textShadow: `0 0 10px ${pack.color}40` }}>
                    {pack.name}
                </h2>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: pack.color }}>
                    {pack.name[0]}
                </div>
            </div>
            
            <div className="space-y-1 mb-4">
                <div className="text-xs font-bold text-white/60 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span> {pack.cardCount} Cartes
                </div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span> {pack.guaranteed}
                </div>
            </div>
        </div>

        <button 
            className={`
                w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg transition-all
                ${disabled ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'text-black hover:brightness-110 active:scale-95'}
            `}
            style={{ backgroundColor: disabled ? undefined : pack.color }}
            onClick={() => onBuy(pack.id)}
            disabled={disabled}
        >
            {t('shop.buy')} <span className="opacity-60 text-[10px] mx-1">|</span> {pack.cost} <MdAttachMoney />
        </button>
      </div>
    </motion.div>
  );
};

export default PackItem;
