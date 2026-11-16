import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
    // Next reads the "@/" path from tsconfig.json. Vitest does not, so a test that
    // imports a module under src which uses that path cannot resolve it.
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        include: ["test/**/*.test.ts"],
        globalSetup: ["test/setup/server.ts"],
        // A run that finds no test file is indistinguishable from a run that
        // passed. Fail instead.
        passWithNoTests: false,
        testTimeout: 60_000,
        hookTimeout: 300_000,
    },
})
