import React from 'react';
import { useLanguage } from '@/app/LanguageContext'; // Corrigé (3 niveaux)
import { GameLog } from '@/types'; // Corrigé (3 niveaux)

interface LogMessageProps {
  logKey: string;
  params: any;
}

const LogMessage: React.FC<LogMessageProps> = ({ logKey, params }) => {
  const { t } = useLanguage();

  const translatedParams = { ...params };
  if (params) {
      Object.keys(params).forEach(k => {
          const val = params[k];
          if (typeof val === 'string' && val.startsWith('logs.')) {
              translatedParams[k] = t(val);
          }
      });
  }

  const fullText = t(logKey, translatedParams);
  if (!fullText) return null;

  const sideYou = t('logs.side_you');
  const sideOpp = t('logs.side_opp');
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(\\b${escapeRegExp(sideYou)}\\b|\\b${escapeRegExp(sideOpp)}\\b)`, 'g');
  const parts = fullText.split(regex);

  return (
    <span className="font-bold">
      {parts.map((part, i) => {
          let colorClass = 'text-white';
          if (part === sideYou) colorClass = 'text-[#afff34]';
          else if (part === sideOpp) colorClass = 'text-red-500';
          return <span key={i} className={colorClass}>{part}</span>;
      })}
    </span>
  );
};

export default LogMessage;
