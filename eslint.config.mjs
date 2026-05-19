import storybook from "eslint-plugin-storybook";
import { fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig(
  { ignores: ["dist/", "storybook-static/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  storybook.configs["flat/recommended"],
  {
    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/prop-types": "off",
    },
  },
);
