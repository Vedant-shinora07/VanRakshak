import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'gu' : 'en');
  };

  return (
    <button 
      onClick={toggleLang} 
      className="text-sm font-semibold text-gray-500 hover:text-green-600 transition"
      type="button"
    >
      EN | ગુ
    </button>
  );
}
