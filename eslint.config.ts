import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
    {
        ignores: ["dist/", "node_modules/", "coverage/", "public/**"],
    },

    eslint.configs.recommended,

    ...tseslint.configs.recommendedTypeChecked,

    {
        files: ["**/*.{ts,tsx}"],

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parserOptions: {
                projectService: true,
            },
        },

        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },

        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            ...reactHooks.configs.recommended.rules,

            "react-refresh/only-export-components": [
                "warn",
                {
                    allowConstantExport: true,
                },
            ],
        },
    },
    {
        files: ["eslint.config.ts"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);
