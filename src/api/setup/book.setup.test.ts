import { it, expect, afterEach, beforeEach } from 'bun:test';
import { SurrealDescribe } from '../../util/test/surreal';
import { prepareConnection, setup } from './setup'
import Elysia from 'elysia';
import { setupBooks } from './book.setup';

SurrealDescribe("unit: Setup Book", async () => {
    beforeEach(() => {
        process.env["BOOK_INFO_STORAGE_TYPE"] = "Surreal"
    })
    afterEach(() => {
        process.env["BOOK_INFO_STORAGE_TYPE"] = undefined
    })
    it("setup successfully", async () => {
        const connection = await prepareConnection();
        const app = new Elysia()
            .use(setup(connection))
            .use(setupBooks)
            .get('/status', ({ bookFileManager, bookInfoStorage }) => {
                return {
                    bookFileManagerDefined: bookFileManager != null,
                    bookInfoStorageDefined: bookInfoStorage != null,
                    bookInfoStorageConnected: bookInfoStorage.connected
                }
            })
        const res = await app.handle(new Request('http://localhost/status')).then((r) => r.json())
        expect(res).toStrictEqual({
            bookFileManagerDefined: true,
            bookInfoStorageDefined: true,
            bookInfoStorageConnected: true
        })
    })
});
