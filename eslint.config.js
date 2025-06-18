import js from "@eslint/js";
import react from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: { react },
  },
  tseslint.configs.recommended,
]);
