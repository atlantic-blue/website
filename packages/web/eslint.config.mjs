import coreWebVitals from "eslint-config-next/core-web-vitals"
import typescript from "eslint-config-next/typescript"

// eslint-config-next 16 ships flat config directly. FlatCompat is not needed and
// fails on it with a circular reference in the schema validator.
const config = [
    { ignores: [".next/**", ".open-next/**", "node_modules/**", "next-env.d.ts"] },
    ...coreWebVitals,
    ...typescript,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
        },
    },
]

export default config
