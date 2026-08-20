import { execFileSync, spawn, type ChildProcess } from "node:child_process"
import { fileURLToPath } from "node:url"
import type { TestProject } from "vitest/node"

const packageRoot = fileURLToPath(new URL("../..", import.meta.url))
const port = 3999
const baseUrl = `http://127.0.0.1:${port}`

let server: ChildProcess | undefined

const isAnswering = async (timeoutMs: number): Promise<boolean> => {
    try {
        await fetch(baseUrl, { signal: AbortSignal.timeout(timeoutMs) })
        return true
    } catch {
        return false
    }
}

/**
 * A server left over from an earlier run answers on the same port, and the suite
 * would then test the previous build and report a pass for code that never ran.
 * Refuse the port rather than reuse it.
 */
const refuseAnOccupiedPort = async (): Promise<void> => {
    if (await isAnswering(1_000)) {
        throw new Error(
            `something is already answering on ${baseUrl}. Stop it before running the tests, ` +
                `otherwise they run against whatever it is serving.`,
        )
    }
}

const waitUntilAnswering = async (): Promise<void> => {
    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
        if (await isAnswering(2_000)) {
            return
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
    }
    throw new Error(`the server did not answer on ${baseUrl}`)
}

/**
 * The tests drive the running server rather than rendering components in
 * isolation, because the thing this site got wrong was the status code, and a
 * component test cannot see one. Build once, start once, then let every test
 * make a real request.
 */
export async function setup(project: TestProject): Promise<void> {
    await refuseAnOccupiedPort()

    execFileSync("npx", ["next", "build"], { cwd: packageRoot, stdio: "inherit" })

    // detached puts the server in its own process group. Killing the npx wrapper
    // alone leaves next-server holding the port, and the next run then either
    // refuses to start or silently tests the previous build.
    server = spawn("npx", ["next", "start", "--port", String(port)], {
        cwd: packageRoot,
        stdio: "inherit",
        detached: true,
    })

    await waitUntilAnswering()
    project.provide("baseUrl", baseUrl)
}

export async function teardown(): Promise<void> {
    if (server?.pid === undefined) {
        return
    }

    // A negative pid signals the whole group, which is what actually holds the port.
    try {
        process.kill(-server.pid, "SIGTERM")
    } catch {
        // already gone
    }

    const deadline = Date.now() + 10_000
    while (Date.now() < deadline) {
        if (!(await isAnswering(500))) {
            return
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
    }

    throw new Error(`the server on ${baseUrl} did not stop, so the next run would test its build`)
}

declare module "vitest" {
    export interface ProvidedContext {
        baseUrl: string
    }
}
