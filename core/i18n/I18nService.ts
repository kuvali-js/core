// @kuvali-js/core/i18n/I18nService.ts
/**********************************************************
 * ### I18n Translations
 **********************************************************/
import { log, Log } from "../log/index";

//***************************************************************************
// the i18n implementation
import * as SecureStore from "expo-secure-store"; // persistence of the language between app starts
import { DotPathsFor, initI18n, Params } from "./lib/i18n";

//***************************************************************************
// TYPES
import { type Translation, type Translations } from "./lib/i18n";
export interface I18nConfig {
  translations: [Translation, ...Translation[]]; // array ha to have min. one element
}

//***************************************************************************
/** ### Returns all strings in set language
 * Service class that encapsulates and abstracts the implementation of the i18n logic.
 * @core-todo
 *  Import and set the languages you use in Translations list.
 * @functions
 * - init()
 * - t()
 * - getLocale()
 * - setLocale()
 * - getAvailableLocales()
 ****************************************************************************/
class I18nService {
  private static readonly CONTEXT: string = "i18n-Service";
  private engine: ReturnType<typeof initI18n> | null = null;

  // Internal registry of available translations
  private translations: Translations = {}; // all set translations
  private currentLocale: string = "en"; // persistence of the language name
  private readonly STORAGE_KEY = "user_language";

  //****************************************************************************
  /** ### Load or set the locale & init translations
   * Use locale already stored on device or set given one
   * Initializes the i18n service by
   * - receiving all translation data for different languages
   * - loading the persisted locale
   * - or sets first of the translation languages list
   * @returns name string of set locale
   ****************************************************************************/
  // @Log(this.CONTEXT)
  public async init(config: I18nConfig): Promise<string> {
    // transform config array to i18n internal record format { "en": { [key: string] }}
    this.translations = config.translations.reduce((acc, item) => {
      const localeKey = item.i18n_meta.code.toLowerCase() as Lowercase<string>;
      acc[localeKey] = item;
      return acc;
    }, {} as Translations);

    //-- set language -------------------
    let locale = config.translations[0].i18n_meta.code; // default language is the first in the config array
    this.currentLocale = locale;

    try {
      // Load language from SecureStore
      let getLocale = await SecureStore.getItemAsync(this.STORAGE_KEY);

      if (!getLocale) {
        getLocale = locale;
        await SecureStore.setItemAsync(this.STORAGE_KEY, locale);
      }

      locale = this.setupLocale(getLocale);
    } catch (error) {
      locale = this.setupLocale(locale);
    }
    log.info(
      `i18n.init: locale set to "${locale}", languages: ${this.getAvailableLocales().join(", ")}`,
    );
    return locale;
  }

  /********************************************************
   *  ### Set locale and return the set locale
   *******************************************************/
  // @Log(this.CONTEXT)
  private setupLocale(locale: string): string {
    this.engine = initI18n(locale, this.currentLocale, this.translations);
    const setLocale = [...this.engine.orderedLocales][0]; // set language -> returns arry with known locales -> first array element is the set language
    this.currentLocale = setLocale;
    return setLocale;
  }

  /********************************************************
   * Sets a new locale and re-initialize the engine.
   * @returns string with locale short code
   *******************************************************/
  public async setLocale(locale: string): Promise<string> {
    this.engine = initI18n(locale, this.currentLocale, this.translations);
    const setLocale = [...this.engine.orderedLocales][0]; // set language -> returns arry with known locales -> first array element is the set language
    await SecureStore.setItemAsync(this.STORAGE_KEY, setLocale);
    this.currentLocale = setLocale;
    return setLocale;
  }

  public getLocale(): string {
    return this.currentLocale;
  }

  public getAvailableLocales(): string[] {
    return Object.keys(this.translations);
  }

  /********************************************************
   * Main translation method.
   *******************************************************/
  public t<S extends DotPathsFor>(key: S, args?: Params<S>): string {
    if (!this.engine) return key;
    return (this.engine.t as any)(key, args);
  }
}

export const i18n = new I18nService();

//### END #####################################################################
