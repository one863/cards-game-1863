import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdReplay, MdHome, MdPlayArrow } from 'react-icons/md';
import { useLanguage } from '../../../app/LanguageContext';

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onClose, onRestart, onQuit }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const menuItems = [
    { label: t('game.continue') || 'REPRENDRE', icon: <MdPlayArrow size={24} />, action: onClose, color: 'bg-[#afff34] text-black' },
    { label: t('game.replay') || 'NOUVEAU MATCH', icon: <MdReplay size={24} />, action: onRestart, color: 'bg-white/10 text-white hover:bg-white/20' },
    { label: t('menu.title') || 'ACCUEIL', icon: <MdHome size={24} />, action: onQuit, color: 'bg-red-500/20 text-red-500 hover:bg-red-500/30' },
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[90]" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl border-t border-white/10 z-[100] max-h-[80%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50">PAUSE</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <MdClose size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-6 flex flex-col gap-4">
            {menuItems.map((item, index) => (
                <button 
                    key={index}
                    onClick={item.action}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${item.color}`}
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </div>
      </motion.div>
    </>
  );
};

export default PauseModal;
