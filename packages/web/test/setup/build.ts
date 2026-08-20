import { execFileSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { fileURLToPath } from "node:url"

const packageRoot = fileURLToPath(new URL("../..", import.meta.url))

/**
 * The tests read the built output rather than the source, because the built
 * output is what a visitor receives. Building once here keeps that honest
 * without paying for a build in every test file.
 */
export async function setup(): Promise<void> {
    const dist = `${packageRoot}dist`
    if (existsSync(dist)) {
        rmSync(dist, { recursive: true })
    }

    execFileSync("npx", ["astro", "build"], {
        cwd: packageRoot,
        stdio: "inherit",
    })

    if (!existsSync(dist)) {
        throw new Error("astro build produced no dist directory")
    }
}
