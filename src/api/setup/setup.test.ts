import { it, expect, afterEach, beforeEach } from 'bun:test';
import { SurrealDescribe } from '../../util/test/surreal';
import { prepareConnection, setup } from './setup'
import Elysia from 'elysia';

SurrealDescribe("unit: Setup", async () => {
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
            .get('/status', ({ connections, pdfium }) => {
                return {
                    connections: Object.keys(connections),
                    pdfiumDefined: pdfium != null
                }
            })
        const res = await app.handle(new Request('http://localhost/status')).then((r) => r.json())
        expect(res).toStrictEqual({
            connections: ["surrealConnection"],
            pdfiumDefined: true
        })
    })
});
