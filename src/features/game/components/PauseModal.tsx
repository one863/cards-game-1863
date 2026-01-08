import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/LanguageContext';
import { MdPlayArrow, MdExitToApp, MdReceiptLong, MdAssessment, MdRefresh } from 'react-icons/md';

interface PauseModalProps {
  onResume: () => void;
  onQuit: () => void;
  onRestart: () => void;
  onShowLogs: () => void;
  onShowStats: () => void;
  isOpen: boolean;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onQuit, onRestart, onShowLogs, onShowStats, isOpen }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
        onClick={onResume}
      >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-xs flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter text-center mb-4">MENU</h2>
            
            {/* Actions Principales */}
            <button 
                onClick={onResume}
                className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all shadow-lg"
            >
                <MdPlayArrow size={24} />
                {t('game.continue')}
            </button>

            <button 
                onClick={onRestart}
                className="w-full py-4 rounded-xl bg-[#afff34]/10 text-[#afff34] border border-[#afff34]/20 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#afff34]/20 active:scale-95 transition-all"
            >
                <MdRefresh size={24} />
                {t('game.replay')}
            </button>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onShowLogs}
                    className="py-3 rounded-xl bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all"
                >
                    <MdReceiptLong size={20} />
                    {t('game.view_logs')}
                </button>
                <button 
                    onClick={onShowStats}
                    className="py-3 rounded-xl bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all"
                >
                    <MdAssessment size={20} />
                    {t('game.match_stats')}
                </button>
            </div>

            <button 
                onClick={onQuit}
                className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-95 transition-all mt-4"
            >
                <MdExitToApp size={24} />
                {t('game.quit_confirm')}
            </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PauseModal;
