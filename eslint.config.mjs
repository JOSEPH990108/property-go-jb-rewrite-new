import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Catch common bugs
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // React best practices
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["scripts/**", "src/db/reset.ts", "src/db/seed.ts", "src/db/seeds/**", "src/lib/sms.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/app/(demo)/**", "src/components/custom/ui/SearchableDropdown.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: [
      "src/components/admin/DynamicDataTable.tsx",
      "src/components/profile/ReferralCodeCard.tsx",
    ],
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
  {
    files: ["src/components/carousel/FanCarousel.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
