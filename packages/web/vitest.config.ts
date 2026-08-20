import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        include: ["test/**/*.test.ts"],
        globalSetup: ["test/setup/build.ts"],
        // A run that finds no test file is indistinguishable from a run that
        // passed. Fail instead.
        passWithNoTests: false,
        testTimeout: 120_000,
    },
})
