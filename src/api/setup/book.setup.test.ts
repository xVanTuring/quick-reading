import { it, expect, afterEach, beforeEach } from 'bun:test';
import { SurrealDescribe } from '../../util/test/surreal';
import { prepareConnection, setupConnection } from './connection.setup'
import Elysia from 'elysia';
import { deriveBooks, setupBooks } from './book.setup';
import { setupUserId } from './user-id.setup';

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
            .use(setupConnection(connection))
            .use(setupUserId)
            .use(setupBooks)
            .use(deriveBooks)
            .get('/status', ({ bookFileManager, bookInfoStorage }) => {
                return {
                    bookFileManagerDefined: bookFileManager != null,
                    bookInfoStorageDefined: bookInfoStorage != null,
                    bookInfoStorageConnected: bookInfoStorage.connected,
                    bookInfoStorageUser: bookInfoStorage.currentUser != null
                }
            })
        const response = await app.handle(new Request('http://localhost/status'))
        expect(response.ok).toBeTrue()
        const json = await response.json()
        expect(json).toStrictEqual({
            bookFileManagerDefined: true,
            bookInfoStorageDefined: true,
            bookInfoStorageConnected: true,
            bookInfoStorageUser: true
        })
    })
});
