// 'eslint.config.ts'

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
// @ts-expect-error
import expoConfig from "eslint-config-expo/flat";

export default defineConfig([
  ...expoConfig,
  {
    rules: {
      "no-multi-spaces": "off",
      "no-multiple-empty-lines": "off",
      "prettier/prettier": "off", // DEAKTIVIERT Prettier-Logik innerhalb von ESLint
    },
  },
  {
    // In der Flat Config heißt das Feld nur "ignores" (global oder per Block)
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
]);
