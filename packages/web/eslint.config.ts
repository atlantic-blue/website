import js from "@eslint/js"
import astro from "eslint-plugin-astro"
import { config, configs } from "typescript-eslint"

export default config(
    { ignores: ["dist", ".astro", "node_modules"] },
    js.configs.recommended,
    configs.recommended,
    astro.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/consistent-type-imports": "error",
        },
    },
)
