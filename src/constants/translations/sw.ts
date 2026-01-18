// src/constants/translations/sw.ts

//---------------------------------------
// core i18n definitons
import { defineTranslation as dt, type Translation } from "@kuvali-js/core";

//---------------------------------------
// app specific
import { gasBrands } from "./brandNames";

const numberStrings = [
  "hakuna",
  "mmoja",
  "mbili",
  "tatu",
  "nne",
  "tano",
  "sita",
  "saba",
  "tisa",
  "kumi",
];

export const sw: Translation = {
  //-------------------------------------
  i18n_meta: {
    code: "sw", // language code, ISO 639-1
    locale: "sw-TZ", // locale, BCP 47 Tag
    name: "Swahili (TZ)", // display name (for admin backend)
    label: "Swahili", // short UI-Label
    nativeName: "Kiswahili", // name in the native language
  },
  //-------------------------------------
  // UI-strings
  greetings: "Habari {name}! Your last login was {lastLoginDate:date}.",
  inboxMessages: dt("Habari {name}, wewe { messages:plural}.", {
    plural: {
      messages: {
        zero: "hakuna jumbe",
        one: "jumbe mmoja",
        other: "jumbe {?}",
        format: "strings",
        strings: numberStrings,
        // format: "numbers", "strings" (0-10)
        // formatter: { style: "currency", currency: "EUR" }
        // type: "cardinal" | "ordinal"
      },
    },
  }),
  global: {
    gasBrandShort: dt("{brand: enum}", { enum: { brand: gasBrands.short } }),
    gasBrandName: dt("{brand: enum}", { enum: { brand: gasBrands.name } }),
    gasBrandPath: dt("{brand: enum}", { enum: { brand: gasBrands.path } }),
  },
  reorder: {
    cylinder: dt("Order another {brand:enum} cylinder", {
      enum: {
        brand: gasBrands,
      },
    }),
    "Change Order": "Customize order",
  },
}
