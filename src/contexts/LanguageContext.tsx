import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE, 
  type SupportedLanguage 
} from "@/lib/i18n/config";

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (lng: SupportedLanguage) => void;
  languages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    () => {
      const pathLang = location.pathname.split("/")[1] as SupportedLanguage;
      return Object.keys(SUPPORTED_LANGUAGES).includes(pathLang)
        ? pathLang
        : DEFAULT_LANGUAGE;
    }
  );

  useEffect(() => {
    // Sync i18n with current language
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const changeLanguage = (lng: SupportedLanguage) => {
    // Get current path without language prefix
    const pathParts = location.pathname.split("/").filter(Boolean);
    const isCurrentLangInPath = Object.keys(SUPPORTED_LANGUAGES).includes(pathParts[0]);
    
    let newPath: string;
    if (isCurrentLangInPath) {
      // Replace existing language prefix
      pathParts[0] = lng;
      newPath = `/${pathParts.join("/")}`;
    } else {
      // Add language prefix (only for non-default languages)
      if (lng !== DEFAULT_LANGUAGE) {
        newPath = `/${lng}${location.pathname}`;
      } else {
        newPath = location.pathname;
      }
    }

    // Update state and navigate
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
    navigate(newPath + location.search + location.hash, { replace: true });
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
