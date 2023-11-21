export function startSurreal(port: number, showLog = false) {
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