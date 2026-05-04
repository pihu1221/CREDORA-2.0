import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'ES' | 'ZH' | 'HI' | 'FR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    home: "Home",
    about: "About",
    features: "Features",
    mentorship: "Mentorship",
    getStarted: "Get Started",
    dashboard: "Dashboard",
    logout: "Log Out",
    premium: "Premium",
    normal: "Normal",
    intelligenceLab: "Intelligence Lab",
    dnaScanner: "Neural DNA Scanner",
    algoHub: "Algo-Readiness Hub",
    logicTest: "Logic Intake Test",
    interviewX: "Interview Simulator X",
    salaryOracle: "Global Salary Oracle"
  },
  ES: {
    home: "Inicio",
    about: "Nosotros",
    features: "Funciones",
    mentorship: "Mentoría",
    getStarted: "Empezar",
    dashboard: "Panel",
    logout: "Cerrar Sesión",
    premium: "Premium",
    normal: "Normal",
    intelligenceLab: "Laboratorio de Inteligencia",
    dnaScanner: "Escáner ADN Neural",
    algoHub: "Hub de Algoritmos",
    logicTest: "Prueba de Lógica",
    interviewX: "Simulador de Entrevista X",
    salaryOracle: "Oráculo de Salarios"
  },
  ZH: {
    home: "首页",
    about: "关于",
    features: "功能",
    mentorship: "导师制",
    getStarted: "开始使用",
    dashboard: "仪表板",
    logout: "登出",
    premium: "高级版",
    normal: "普通版",
    intelligenceLab: "情报实验室",
    dnaScanner: "神经DNA扫描仪",
    algoHub: "算法就绪中心",
    logicTest: "逻辑摄入测试",
    interviewX: "面试模拟器 X",
    salaryOracle: "全球薪资预测"
  },
  HI: {
    home: "मुख्य पृष्ठ",
    about: "बारे में",
    features: "विशेषताएं",
    mentorship: "परामर्श",
    getStarted: "शुरू करें",
    dashboard: "डैशबोर्ड",
    logout: "लॉग आउट",
    premium: "प्रीमियम",
    normal: "सामान्य",
    intelligenceLab: "इंटेलिजेंस लैब",
    dnaScanner: "न्यूरल डीएनए स्कैनर",
    algoHub: "एल्गो-तैयारी हब",
    logicTest: "लॉजिक सेवन टेस्ट",
    interviewX: "इंटरव्यू सिम्युलेटर X",
    salaryOracle: "ग्लोबल सैलरी ओरेकल"
  },
  FR: {
    home: "Accueil",
    about: "À propos",
    features: "Fonctions",
    mentorship: "Mentorat",
    getStarted: "Commencer",
    dashboard: "Tableau de bord",
    logout: "Déconnexion",
    premium: "Premium",
    normal: "Normal",
    intelligenceLab: "Labo d'Intelligence",
    dnaScanner: "Scanner ADN Neural",
    algoHub: "Hub d'Algorithmes",
    logicTest: "Test de Logique",
    interviewX: "Simulateur d'Entretien X",
    salaryOracle: "Oracle des Salaires"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('credora_lang');
    return (saved as Language) || 'EN';
  });

  useEffect(() => {
    localStorage.setItem('credora_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || translations['EN'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
