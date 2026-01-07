// @kuvali/core/i18n/context/TranslationContext.tsx
import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { i18n } from './I18nService'; // Import the singleton service

/**
 * Extract types from the service's t-function
 */
type TFunction = typeof i18n.t;

interface TranslationContextType {
  t: TFunction;
  locale: string;
  setLocale: (locale: string) => Promise<void>; // Added Promise
  availableLocales: string[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<string>(i18n.getLocale());

  const contextValue = useMemo(() => ({
    // Use 'Parameters' to keep the strict typing from the I18nService
    t: (key: Parameters<TFunction>[0], args?: Parameters<TFunction>[1]) => i18n.t(key, args),
    locale,
    setLocale: async (newLocale: string) => {
      const confirmedLocale = await i18n.setLocale(newLocale);
      setLocaleState(confirmedLocale);
    },
    availableLocales: i18n.getAvailableLocales(),
  }), [ locale ]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("Kuvali useTranslation must be used within TranslationProvider (via CoreProvider)");
  }
  return context;
};