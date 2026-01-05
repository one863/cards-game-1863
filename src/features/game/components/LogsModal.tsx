import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdContentCopy, MdCheck } from 'react-icons/md';
import { useLanguage } from '../../../app/LanguageContext';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: any[];
  copyLogs: () => void;
  logsCopied: boolean;
  formatLogText: (key: string, params: any) => React.ReactNode;
}

const LogsModal: React.FC<LogsModalProps> = ({ 
  isOpen, 
  onClose, 
  logs, 
  copyLogs, 
  logsCopied, 
  formatLogText 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }} 
      animate={{ y: 0 }} 
      exit={{ y: '100%' }} 
      transition={{ type: 'spring', damping: 25 }} 
      className="absolute inset-0 bg-[#080808] z-[120] flex flex-col"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center pt-10">
        <h2 className="text-[#afff34] font-black uppercase tracking-widest text-sm">{t('game.view_logs')}</h2>
        <div className="flex gap-8">
            <button 
              onClick={copyLogs} 
              className={`${logsCopied ? 'text-green-500 scale-125' : 'text-[#444] hover:text-white'} transition-all duration-300`}
            >
              {logsCopied ? <MdCheck size={28} /> : <MdContentCopy size={24} />}
            </button>
            <button onClick={onClose} className="text-[#444] hover:text-white">
              <MdClose size={28} />
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text">
          {logs.map((log) => (
              <div key={log.id} className="text-[11px] text-[#666] font-bold border-b border-white/5 pb-3 leading-relaxed">
                  <span className="text-[#afff34] mr-3">➜</span> 
                  {formatLogText(log.key, log.params)}
              </div>
          ))}
      </div>
    </motion.div>
  );
};

export default LogsModal;