// src/constants/translations/sw.ts

//---------------------------------------
// core i18n definitons
import { defineTranslation as dt, type Translation } from "@kuvali-js/core";

//---------------------------------------
// app specific
import { gasBrands } from "./brandNames";

/** ### i18n translation structure definition
 *
 */

const numberStrings = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "Eight",
  "nine",
  "ten",
];

export const en: Translation = {
  //-------------------------------------
  i18n_meta: {
    code: "en", // language code, ISO 639-1
    locale: "en-GB", // locale, BCP 47 Tag
    name: "English (UK)", // display name (for admin backend)
    label: "English", // short UI-Label
    nativeName: "English", // name in the native language
    markMissingTranslation: 'Translation missing: \"{key}\"',
  },
  //-------------------------------------
  // UI-strings
  inboxMessages: dt("Hello {name}, you have { messages: plural }.", {
    plural: {
      messages: {
        zero: "no messages",
        one: "one message",
        other: "{?} messages",
        format: "strings",
        strings: numberStrings,
        // format: "numbers", "strings" (0-10)
        // formatter: { style: "currency", currency: "EUR" }
        // type: "cardinal" | "ordinal"
      },
    },
  }),
  nested: {
    greetings: "Hello {names: list}!",
  },
  global: {
    gasBrandShort: dt("{brand: enum}", { enum: { brand: gasBrands.short } }),
    gasBrandName: dt("{brand: enum}", { enum: { brand: gasBrands.name } }),
    gasBrandPath: dt("{brand: enum}", { enum: { brand: gasBrands.path } }),
    cylinder: "cylinder",
  },
  brand: {
    // page
    "Select Brand": "Select Brand", // AppBar title
    "Exchange your cylinder":
      "Exchange your {brand: global.gasBrandShort} cylinder",
    "Shop for Accessories": "Shop for Accessories",
  },
  cylinder: {
    // page
    appbartitle: "{brand: global.gasBrandName} - Order Details",
    "Add to Cart": "Add to Cart",
    "New Cylinder": "New ",
    "Exchange Cylinder": "Exchange",
    price: "Your order is TZS {price} for",
    "Your order is": "Your order is",
    for: "for",
    description: dt(
      " {count: plural} {new:literal} {weight} {brand: global.gasBrandShort} {gas} {cylinder: plural} {exchange}",
      {
        plural: {
          count: { zero: "0", one: "a", other: "{?} x" },
          cylinder: { one: "cylinder", other: "cylinders" },
        },
        literal: {
          new: "brand new",
          exchange: "for exchange",
          gas: "gas",
        },
      },
    ),
  },
  userCartPage: {
    // cart page
    appbartitle: "My Cart",
    cartItems: dt("{items: plural}", {
      plural: {
        items: {
          zero: "empty cart",
          one: "1 cart item",
          other: "{?} cart items",
        },
      },
    }),
    "Set Delivery Location": "Set Delivery Location",
  },
}
