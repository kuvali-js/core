// @kuvali/core/i18n/lib/i18n.ts
import type { defineTranslation, ParamOptions } from "./defineTranslation"


interface Register { }

type I18nMessage = string | ReturnType<typeof defineTranslation>

export type LanguageMessages = {
  [key: string]: I18nMessage | LanguageMessages;
};

export type I18nMeta = {
  code:       string;     // language code, ISO 639-1
  locale?:    string;     // locale, BCP 47 Tag
  name?:      string;     // display name (for admin backend)
  label:      string;     // short UI-Label
  nativeName: string;     // name in the native language
  markMissingTranslation?: string;
};

export type Translation = {
  i18n_meta: I18nMeta;
  [key: string]: I18nMessage | LanguageMessages;
};

export type Translations = Record<Lowercase<string>, Translation>
type EnumMap = Record<string, Record<string, string>>

export type RegisteredTranslations = Register extends { translations: infer T }
  ? T extends infer Translations
    ? Translations
    : never
  : LanguageMessages



type ParseArgType<
  ParamType extends string,
  ParamName extends string,
  Enums extends EnumMap
> = ParamType extends "number" | "plural"  ? number
  : ParamType extends "date"  ? Date
  : ParamType extends "list"  ? string[]
  : ParamType extends "enum"
    ? ParamName extends keyof Enums
      ? keyof Enums[ParamName]
      : never
    : never

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never

export type DotPathsFor<T extends object = RegisteredTranslations> = {
  [K in keyof T]:
    T[K] extends I18nMessage ? K
    : T[K] extends object ? Join<K, DotPathsFor<T[K]>>
    : string
}[keyof T]


type ExtractParamArgs<
  S extends string,
  Enums extends EnumMap
> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param extends ` ${infer Name}: ${infer Type} ` // If the string contains a parameter
    ? { [K in Name]: ParseArgType<Type, Name, Enums> } & ExtractParamArgs<
        Rest,
        Enums
      > // If the string contains a parameter with a type
    : { [K in Param]: string } & ExtractParamArgs<Rest, Enums> // If the string has no parameter type
  : unknown // If the string has no parameters

type TranslationAtKeyWithParams<
  Translations,
  Key extends string
> = Key extends `${infer First}.${infer Rest}`
  ? First extends keyof Translations
    ? TranslationAtKeyWithParams<Translations[First], Rest>
    : never
  : Key extends keyof Translations
  ? Translations[Key]
  : never

type NormalizedTranslationAtKey<T> = T extends ReturnType<
  typeof defineTranslation
>
  ? T
  : [T, ReturnType<typeof defineTranslation>[1]]

type NormalizedTranslationAtKeyWithParams<Key extends string> =
  NormalizedTranslationAtKey<
    TranslationAtKeyWithParams<RegisteredTranslations, Key>
  >

export type Params<S extends DotPathsFor> = ExtractParamArgs<
  string,
  NormalizedTranslationAtKeyWithParams<S>[1] extends {
    enum: infer E
  }
    ? keyof E extends string
      ? EnumMap
      : E
    : EnumMap
>

type PathsWithParams = {
  [K in DotPathsFor]: keyof Params<K> extends string ? string : K
}[DotPathsFor]

type PathsWithNoParams = {
  [K in DotPathsFor]: keyof Params<K> extends string ? K : string
}[DotPathsFor]


/**********************************************************
* ### Sets up the language order and returns the translation function t()
*
* #### The translation function t() returns the translation for the given key
* - checks all languages in order for the key
* - performs neccessary substitutions
* - returns the key if it was not found in any language
* @param key {string} of what to translate
* @param args {object} for substitutions within the translation string, see performSubstitution()
* @returns translation | key {string}
* - translation with substitutions or
* - key if not found in any given language
*/
export function initI18n(
  locale: string,
  fallbackLocale: string | string[],
  translations: Translations
): {
    orderedLocales: Set<string>;
    t: {
        <S extends PathsWithNoParams>(key: S): string;
        <S extends PathsWithParams, A extends Params<S>>(key: S, args: A): string;
    };
} {
  const fallbackLocales = Array.isArray(fallbackLocale)
    ? fallbackLocale
    : [fallbackLocale]

  const orderedLocales = new Set([
    ...getOrderedLocaleAndParentLocales(locale),
    ...fallbackLocales.flatMap(getOrderedLocaleAndParentLocales),
  ])

  function t<S extends PathsWithNoParams>(key: S): string
  function t<S extends PathsWithParams, A extends Params<S>>(key: S, args: A): string
  function t<S extends DotPathsFor, A extends Params<S>>(key: S, args?: A) {
    for (const locale of orderedLocales) {
      const translationObject = translations[locale.toLowerCase() as Lowercase<string>]     // translations of one language
      if (translationObject == null) continue
      const translation = getTranslation(locale, translationObject, key, args)
      if (translation) return translation
      // if translation was not found, ...
      if (translationObject !== null) {
        if (translationObject["markMissingTranslation"] !== undefined) {
          // ... if defined, return a warning message for missing translation.
          return (translationObject.i18n_meta.markMissingTranslation as string).replace("{key}", key)
        }
      }
      return key    // ...returns the key.
    }
  } // t()

  return { orderedLocales, t };
}

export type TranslateType = {
  t: {
    <S extends PathsWithNoParams>(key: S): string;
    <S extends PathsWithParams, A extends Params<S>>(key: S, args: A): string;
    <S extends DotPathsFor, A extends Params<S>>(key: S, args?: A): string;
  }
};


/**********************************************************
* ### Returns the locale and all it's parent locales in this order
*/
function getOrderedLocaleAndParentLocales(locale: string) {
  const locales = []
  let parentLocale = locale
  while (parentLocale !== "") {
    locales.push(parentLocale)
    parentLocale = parentLocale.replace(/-?[^-]+$/, "")
  }
  return locales
}


/**********************************************************
* ### returns the language string of the given key
* - translations are the strings/arrays of ONE language
* - does parameter substitutions
*/
function getTranslation<S extends DotPathsFor, A extends Params<S>>(
  locale: string,
  translations: Translation | LanguageMessages,
  key: S,
  args?: A
) {
  const translation = getTranslationByKey(translations, key)
  const argObj = args || {}
  try {

    if (typeof translation === "string") {
      if (args === undefined) return translation
      return performSubstitution(locale, translation, argObj, {}, translations)
    }

    if (Array.isArray(translation)) {
      const [str, translationParams] = translation
      return performSubstitution(locale, str, argObj, translationParams as ParamOptions, translations)
    }
  } catch {
    return undefined
  }
  return undefined
}

/**********************************************************
* ### Returns translation string or object of given, nested key
* -
* @param obj {object} object of the translation strings or arrays of ONE language
* @param key {string} key of the requested translation string in the given language
* @returns {string | object}
* - string or object of the requested key or
* - undefined, if the key does not exist in this language
*/
function getTranslationByKey(obj: Translation | LanguageMessages, key: string) {
  const keys = key.split(".")
  let currentObj = obj

  for (let i = 0; i <= keys.length - 1; i++) {
    const k = keys[ i ]
    if (k === 'i18n_meta') return undefined;  // ignore i18n_meta settings for translation
    const newObj = currentObj[k]
    if (newObj == null) return undefined

    if (typeof newObj === "string" || Array.isArray(newObj)) {
      if (i < keys.length - 1) return undefined
      return newObj
    }

    currentObj = newObj
  }

  return undefined
}

/**********************************************************
* ### Return if the string is a key in the given map
* - used for additional functionality in "plural"
*   like: check if "zero" exists as key in pluralMap
*   like: check if "format" exists as key in pluralMap
* @param map {object} the object to check
* @param key {string} key to check in the map object
* @returns boolean {boolean} - true if the key is a key of the map, false otherwise
*/
const inMap = (map: object, key: string) => Object.keys(map as object).includes(key);

/**********************************************************
* ### Return the given string (str) with all parameters substituted by
* - the given args (args)
* - with the the given translationParams (see below)
* - according to the given language (locale)
*/
function performSubstitution(
  locale: string,
  str: string,
  args: Record<string, unknown>,
  translationParams: ParamOptions,
  translations: LanguageMessages,     // to recursively get translations in substitutions of default case
): string {
  return Object.entries(args).reduce((result, [argKey, argValue]) => {
    argKey = argKey.toLowerCase()
    const match = result.match(`{ *${argKey}: *?([^}]*)? *}`)
    const [replaceKey, argType] = match ? match : [`{${argKey}}`, undefined]
    const argTypeTrim = argType?.trim()

    switch (argTypeTrim) {
      // --------------------------------
      case "plural": {
        if (typeof argValue === "string") argValue = Number.parseFloat(argValue)
        if (typeof argValue !== "number") throw new Error("Invalid argument")
        const pluralMap = translationParams.plural?.[argKey]
        const pluralRules = new Intl.PluralRules(locale, { type: pluralMap?.type, })

        let replacement = pluralMap?.[pluralRules.select(argValue)] ?? pluralMap?.other;
        switch (true) {
          case argValue === 0 && inMap(pluralMap as object, "zero"):
            replacement = pluralMap?.["zero"]; break;
          case argValue >= 0 && argValue <= 10 && inMap(pluralMap as object, "format"):
            if (pluralMap?.format === "strings") {
              replacement = replacement!.replace(`{?}`, pluralMap?.strings[argValue]); break;
            }
        }

        if (replacement == null) throw new Error(`i18n.ts >case: plural<:\nTranslation: Missing replacement value:\nkey ${argValue}\nnot found in plural definitions: ${pluralMap} `)
        const numberFormatter = new Intl.NumberFormat(
          locale,
          translationParams.plural?.[argKey]?.formatter
        )
        return result.replace(
          replaceKey,
          replacement.replace(`{?}`, numberFormatter.format(argValue))
        )
      }
      // --------------------------------
      case "number": {
        if (typeof argValue !== "number") throw new Error("Invalid argument")
        const numberFormat = new Intl.NumberFormat(
          locale,
          translationParams.number?.[argKey]
        )

        return result.replace(replaceKey, numberFormat.format(argValue))
      }
      // --------------------------------
      case "list": {
        if (!Array.isArray(argValue)) throw new Error("Invalid argument")

        const formatter = new Intl.ListFormat(
          locale,
          translationParams.list?.[argKey]
        )
        return result.replace(replaceKey, formatter.format(argValue))
      }
      // --------------------------------
      case "date": {
        if (!(argValue instanceof Date)) throw new Error("i18n.ts >case: Date<:\nTranslation: Invalid argument is not a Date.")

        const dateFormat = new Intl.DateTimeFormat(
          locale,
          translationParams.date?.[argKey]
        )
        return result.replace(replaceKey, dateFormat.format(argValue))
      }
      // --------------------------------
      case "enum": {
        if (typeof argValue !== "string") throw new Error("Invalid argument")
        const enumMap = translationParams.enum?.[argKey]
        const replacement = enumMap?.[argValue.toLowerCase()]

        if (replacement == null) throw new Error(`i18n.ts >case: enum<:\nTranslation: Missing replacement value:\nkey ${argValue}\nnot found in enum: ${enumMap} `)
        return result.replace(replaceKey, replacement)
      }
      // --------------------------------
      default: {
        if (typeof argValue !== "string") throw new Error("i18n: Invalid argument")
        // console.log(`argType: "${argTypeTrim}", argKey "${argKey}", argValue "${argValue}" `)
        let replacement
        if (argTypeTrim != undefined) {
          // an argType other than defined in ParamOptions given: recursion into all translations
          replacement = getTranslation(locale, translations, argTypeTrim, { [argKey]: argValue })
          if (replacement == undefined) throw new Error(`i18n.ts >case: default<:\nTranslation: Missing replacement value:\nkey ${argKey}\nnot found in literals, all translation or provided a value.`)
        } else {
          replacement = translationParams.literal?.[argValue.toLowerCase()]
          if (replacement == null) replacement = argValue
        }
        // console.log(`argKey "${argKey}", argValue "${argValue}", replacement: ${replacement} `)
        return result.replace(replaceKey, replacement)
      }
    }
  }, str)
}
