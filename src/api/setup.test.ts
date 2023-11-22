import { it, expect, afterEach } from 'bun:test';
import { SurrealDescribe } from '../util/test/surreal';
import { prepareResource, setup } from './setup'
import Elysia from 'elysia';

SurrealDescribe("unit: Setup", async () => {
    it("setup successfully", async () => {
        const resource = await prepareResource();
        const app = new Elysia()
            .use(setup(resource))
            .get('/status', ({ store: { storage }, pdfium }) => {
                return {
                    bookInfoStorageConnected: storage.bookInfoStorage.connected,
                    fileListerDefined: storage.bookFileManager != null,
                    pdfiumDefined: pdfium != null
                }
            })
        const res = await app.handle(new Request('http://localhost/status')).then((r) => r.json())
        expect(res).toStrictEqual({
            bookInfoStorageConnected: true,
            fileListerDefined: true,
            pdfiumDefined: true
        })
    })
    afterEach(() => {
        process.env["PDFIUM_INIT_THROW"] = undefined
        process.env["BOOK_INFO_THROW"] = undefined
    });

    it("Failed to init pdfium", async () => {
        process.env["PDFIUM_INIT_THROW"] = "1"
        try {
            await prepareResource();
            expect(false).toBe(true)
        } catch (error) {
            expect((error as Error).message).toBe("Unable to initial pdfium")
        }
    })
    it("Failed to init bookinfo", async () => {
        process.env["BOOK_INFO_THROW"] = "1"
        try {
            await prepareResource();
            expect(false).toBe(true)
        } catch (error) {
            expect((error as Error).message).toBe("Unable to connect to book info storage")
        }
    })
});
