import { it, expect, afterEach, beforeEach } from 'bun:test';
import { SurrealDescribe } from '../../util/test/surreal';
import { prepareConnection, setupConnection } from './connection.setup'
import Elysia from 'elysia';
import { setupUserInfo } from './user.setup';

SurrealDescribe("unit: Setup User", async () => {
    beforeEach(() => {
        process.env["USER_INFO_STORAGE_TYPE"] = "Surreal"
    })
    afterEach(() => {
        process.env["USER_INFO_STORAGE_TYPE"] = undefined
    })
    it("setup successfully", async () => {
        const connection = await prepareConnection();
        const app = new Elysia()
            .use(setupConnection(connection))
            .use(setupUserInfo)
            .get('/status', ({ userInfoStorage }) => {
                return {
                    userInfoStorageDefned: userInfoStorage != null,
                    userInfoStorageConnected: userInfoStorage.connected
                }
            })
        const response = await app.handle(new Request('http://localhost/status'))
        expect(response.ok).toBeTrue()
        const json = await response.json()
        expect(json).toStrictEqual({
            userInfoStorageDefned: true,
            userInfoStorageConnected: true
        })
    })
});
