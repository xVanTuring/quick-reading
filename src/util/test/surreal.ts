import { Subprocess } from 'bun';
import { describe, beforeEach, afterEach, beforeAll } from 'bun:test';

function startSurreal(port: number, showLog = false) {
    const args = [
        "surreal", "start", "--no-banner",
        "--user", "root",
        "--pass", "root",
        "--bind", `0.0.0.0:${port}`]
    if (!showLog) {
        args.push("-l", "none")
    }
    return Bun.spawn(args)
}
export function SurrealDescribe(name: string, action: () => Promise<void> | void) {
    const SURREALDB_PORT = 8087;
    describe(name, async () => {
        beforeAll(() => {
            process.env["SURREAL_URL"] = `ws://localhost:${SURREALDB_PORT}`
        });

        let surrealDbProcess: Subprocess
        beforeEach(async () => {
            surrealDbProcess = startSurreal(SURREALDB_PORT)
            await Bun.sleep(200);
            if (surrealDbProcess.killed) {
                throw new Error("Unable to start surreal");
            }
        });

        afterEach(async () => {
            surrealDbProcess.kill()
            await surrealDbProcess.exited;
        })
        await action()
    });
}

// test script for surreal list here for copy
/**
    let surrealDbProcess: Subprocess
    beforeEach(async () => {
        surrealDbProcess = startSurreal(8180)
        await Bun.sleep(200);
        storage = new SurrealBookInfoStorage({
            url: "ws://127.0.0.1:8180",
            username: "root",
            password: "root",
            namespace: "test",
            database: "test",
        });
        await storage.ready();
    });

    afterEach(async () => {
        surrealDbProcess.kill()
        await Bun.sleep(200);
    })
 */