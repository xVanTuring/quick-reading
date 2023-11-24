import { expect, it } from "bun:test";
import { SurrealDescribe } from "../../util/test/surreal";
import Elysia from "elysia";
import { prepareConnection, setupConnection } from "../setup/connection.setup";
import { setupUserInfo } from "../setup/user.setup";
import { authApi } from "./auth";
import { buildBunRequestBody } from "../../util/test/elysia";
import jwt from "@elysiajs/jwt";

SurrealDescribe("e2e: Auth", async () => {
    const URL_PREFIX = "http://localhost/"

    async function buildApp() {
        const connection = await prepareConnection()
        const app = new Elysia()
            .use(setupConnection(connection))
            .use(setupUserInfo)
            .use(jwt({
                name: 'jwt',
                secret: 'password'
            }))
            .derive(async (decorators) => {
                await decorators.userInfoStorage.prepare()
                return decorators
            })
            .use(authApi)
        return app;
    }
    async function registerUser(app: Elysia, userName: string = "joedv", password = "12345asd") {
        const response = await app.handle(buildBunRequestBody(`${URL_PREFIX}signup`, "POST", {
            username: userName,
            password: password
        }))
        if (!response.ok) {
            console.error(await response.text())
        }
        expect(response.ok).toBeTrue()
        return response.json<{ token: string }>()
    }

    it("shall register user", async () => {
        const app = await buildApp();
        const response = await registerUser(app)
        expect(response.token).toBeDefined()
    })

    it("shall not register two same user", async () => {
        const app = await buildApp();
        await registerUser(app, "miaaa", "12345asd")
        const response = await app.handle(buildBunRequestBody(`${URL_PREFIX}signup`, "POST", {
            username: "miaaa",
            password: "12345asd"
        }))
        expect(response.ok).toBeFalse()
    })

    it("shall login", async () => {
        const app = await buildApp();
        await registerUser(app, "miaaa", "password")
        const response = await app.handle(buildBunRequestBody(`${URL_PREFIX}login`, "POST", {
            username: "miaaa",
            password: "password"
        }))
        expect(response.ok).toBeTrue()
        const json = await response.json<{ token: string }>()
        expect(json.token).toBeDefined();
    })
});