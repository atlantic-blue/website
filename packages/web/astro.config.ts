import { defineConfig } from "astro/config"

// The site builds to static files so every page can be cached at the edge.
// See docs/AUDIT-2026-08.md section 2.3 for why the rendering Lambda is going.
export default defineConfig({
    site: "https://atlanticblue.solutions",
    output: "static",
    trailingSlash: "never",
    build: {
        format: "file",
        assets: "assets",
    },
})
