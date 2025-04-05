import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Convert the current file URL to a file path and get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the FlatCompat with the base directory
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLint Configuration
const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals", // Recommended Next.js settings
      "next/typescript",       // TypeScript-specific settings for Next.js
    ],
    rules: {
      "react/no-unescaped-entities": "off", // Disable react/no-unescaped-entities rule
      "@next/next/no-page-custom-font": "off", // Disable page custom font rule
      "@typescript-eslint/no-unused-vars": "off", // Disable unused variables rule for TypeScript
      "@typescript-eslint/no-explicit-any": "off", // Allow explicit any type in TypeScript
    },
  }),
];

export default eslintConfig;
