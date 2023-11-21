import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'bun:test';
import { Subprocess } from 'bun';
import { startSurreal } from '../util/test/surreal';
import { setup } from './setup'
import Elysia from 'elysia';
const SURREALDB_PORT = 8087;

describe("Elysia Setup", async () => {
    beforeAll(() => {
        process.env["SURREAL_URL"] = `ws://localhost:${SURREALDB_PORT}`
    });

    let surrealDbProcess: Subprocess
    beforeEach(async () => {
        surrealDbProcess = startSurreal(SURREALDB_PORT)
        await Bun.sleep(200);
    });

    afterEach(async () => {
        surrealDbProcess.kill()
        await Bun.sleep(200);
    })
    it("setup init", async () => {

        const app = new Elysia()
            .use(setup)
            .get('/status', ({ store: { storage }, pdfium }) => {
                return {
                    bookInfoStorageConnected: storage.bookInfoStorage.connected,
                    fileListerDefined: storage.bookFileManager != null,
                    pdfiumDefined: pdfium != null
                }
            })
        await app.modules
        const res = await app.handle(new Request('http://localhost/status')).then((r) => r.json())
        expect(res).toStrictEqual({
            bookInfoStorageConnected: true,
            fileListerDefined: true,
            pdfiumDefined: true
        })

    })
});