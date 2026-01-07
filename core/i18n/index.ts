// @kuvali/core/i18n/index.ts

//---------------------------------------
// Export the Hook for the UI
export { useI18n } from './TranslationContext';

//---------------------------------------
// Export the Service for the app to call i18n.init()
export { i18n } from './I18nService';
export { TranslationProvider } from './TranslationContext';

//---------------------------------------
// Export Types
export type { I18nConfig } from './I18nService';

//### END #####################################################################
