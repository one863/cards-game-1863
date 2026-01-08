import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdContentCopy, MdCheck } from 'react-icons/md';
import { GameLog } from '@/types';
import { useLanguage } from '@/app/LanguageContext';
import LogMessage from './LogMessage';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GameLog[];
  copyLogs: () => void;
  logsCopied: boolean;
}

const LogsModal: React.FC<LogsModalProps> = ({ 
  isOpen, onClose, logs, copyLogs, logsCopied 
}) => {
  const { t } = useLanguage();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Scroll logic if needed
    }
  }, [isOpen, logs]);

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
        <div className="flex gap-4">
            <button onClick={copyLogs} className="text-[#666] hover:text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
                {logsCopied ? <MdCheck className="text-[#afff34]" size={18} /> : <MdContentCopy size={18} />}
                {logsCopied ? 'COPIED' : 'COPY'}
            </button>
            <button onClick={onClose} className="text-[#444] hover:text-white">
                <MdClose size={28} />
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-xs">
          {logs.map((log) => (
              <div key={log.id} className="border-l-2 border-white/10 pl-3 py-1 text-white/80">
                  <LogMessage logKey={log.key} params={log.params} />
              </div>
          ))}
          <div ref={logsEndRef} />
      </div>
    </motion.div>
  );
};

export default LogsModal;
