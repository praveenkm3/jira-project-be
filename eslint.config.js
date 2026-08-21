import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import noComments from "eslint-plugin-no-comments";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],

    extends: [js.configs.recommended, tseslint.configs.recommended],

    languageOptions: {
      globals: globals.node,
    },

    plugins: {
      "no-comments": noComments,
    },

    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "no-comments/disallowComments": "error",
    },
  },
]);
