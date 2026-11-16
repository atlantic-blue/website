import { spawn, type ChildProcess } from "node:child_process"
import { afterEach, describe, expect, it } from "vitest"

import { stopTheProcessGroup } from "./setup/server"

const patience = { polite: 400, insistent: 5_000 }

const alive = (pid: number): boolean => {
    try {
        process.kill(pid, 0)
        return true
    } catch {
        return false
    }
}

/** detached gives the child its own group, so a group signal cannot reach this run. */
const startAChild = (body: string): ChildProcess =>
    spawn(process.execPath, ["-e", `${body}; setInterval(() => {}, 1000); console.log("ready")`], {
        stdio: ["ignore", "pipe", "ignore"],
        detached: true,
    })

/**
 * A child exists before it runs its script, and a signal that arrives in that
 * window gets the default disposition rather than the handler. Wait for the
 * child to say it is ready, or the test proves nothing about the handler.
 */
const untilReady = async (child: ChildProcess): Promise<number> => {
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("the child never said ready")), 10_000)
        child.stdout!.once("data", () => {
            clearTimeout(timer)
            resolve()
        })
    })
    const pid = child.pid!
    expect(alive(pid)).toBe(true)
    return pid
}

describe("stopping the test server", () => {
    let child: ChildProcess | undefined

    afterEach(() => {
        if (child?.pid !== undefined && alive(child.pid)) {
            try {
                process.kill(-child.pid, "SIGKILL")
            } catch {
                // already gone
            }
        }
        child = undefined
    })

    it("stops a process that answers SIGTERM", async () => {
        child = startAChild("void 0")
        const pid = await untilReady(child)

        const stopped = await stopTheProcessGroup(pid, async () => alive(pid), patience)

        expect(stopped).toBe(true)
        expect(alive(pid)).toBe(false)
    })

    // The fault this answers: a graceful server waits for the connections the
    // suite left open, the polite window runs out, and the whole run fails after
    // every test passed.
    it("stops a process that ignores SIGTERM", async () => {
        child = startAChild("process.on('SIGTERM', () => {})")
        const pid = await untilReady(child)

        const stopped = await stopTheProcessGroup(pid, async () => alive(pid), patience)

        expect(stopped).toBe(true)
        expect(alive(pid)).toBe(false)
    })

    it("reports a process it cannot stop, rather than reporting a stop", async () => {
        child = startAChild("void 0")
        const pid = await untilReady(child)

        const stopped = await stopTheProcessGroup(pid, async () => true, {
            polite: 200,
            insistent: 200,
        })

        expect(stopped).toBe(false)
    })
})
