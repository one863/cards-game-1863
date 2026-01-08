import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';
import { MdAttachMoney, MdLayers, MdAutoAwesome } from 'react-icons/md';

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
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 group shadow-2xl transition-all duration-300"
    >
      {/* Dynamic Gradient Background */}
      <div 
        className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20" 
        style={{ background: `radial-gradient(circle at top right, ${pack.color}, transparent)` }} 
      />
      
      <div className="relative p-6 flex flex-col h-full gap-6">
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[3px] mb-1" style={{ color: pack.color }}>BOOSTER PACK</span>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white drop-shadow-md">
                    {pack.name}
                </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500" style={{ backgroundColor: pack.color }}>
                {pack.name[0]}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest block mb-1">QUANTITY</span>
                <div className="flex items-center gap-2">
                    <MdLayers className="text-white/40" size={14} />
                    <span className="text-sm font-black text-white">{pack.cardCount} <span className="text-[9px] text-white/40">cards</span></span>
                </div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest block mb-1">GUARANTEED</span>
                <div className="flex items-center gap-2">
                    <MdAutoAwesome className="text-white/40" size={14} />
                    <span className="text-[10px] font-black text-white leading-none truncate">{pack.guaranteed}</span>
                </div>
            </div>
        </div>

        <motion.button 
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={`
                w-full py-4 rounded-xl font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-2 shadow-2xl transition-all border-t border-white/20
                ${disabled ? 'bg-white/10 text-white/20 cursor-not-allowed border-none' : 'text-black hover:brightness-110'}
            `}
            style={{ backgroundColor: disabled ? undefined : pack.color }}
            onClick={() => onBuy(pack.id)}
            disabled={disabled}
        >
            {t('shop.buy')} 
            <div className="h-4 w-px bg-black/20 mx-1"></div>
            <span className="flex items-center gap-0.5">{pack.cost} <MdAttachMoney size={14} /></span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PackItem;
