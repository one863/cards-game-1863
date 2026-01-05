import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '../core/i18n/fr.json';
import en from '../core/i18n/en.json';

type LanguageContextType = {
  t: (key: string, params?: Record<string, any>) => string;
  langCode: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<string, any> = { fr, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLanguageState] = useState(() => localStorage.getItem('1863_lang') || 'en');

  const setLanguage = (lang: string) => {
    localStorage.setItem('1863_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    if (!key) return "";
    
    // Le JSON est plat (ex: "menu.title": "Valeur"), on accède directement
    let value = dictionaries[langCode][key];

    // Fallback : Si non trouvé, on retourne la clé
    if (typeof value !== 'string') {
        // Optionnel : Essayer de split si on décide de changer la structure du JSON plus tard
        // Mais pour l'instant, restons simple et robuste avec la structure actuelle.
        return key;
    }

    if (params) {
      let result = value;
      Object.keys(params).forEach(paramKey => {
        // Remplacement de {param} (et non {{param}})
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
      return result;
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ t, langCode, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
