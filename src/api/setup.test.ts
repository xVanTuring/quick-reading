import { it, expect } from 'bun:test';
import { SurrealDescribe } from '../util/test/surreal';
import { prepareResource, setup } from './setup'
import Elysia from 'elysia';

SurrealDescribe("unit: Setup", async () => {
    it("setup", async () => {
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
});
