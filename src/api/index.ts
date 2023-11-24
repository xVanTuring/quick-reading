import { Elysia, t } from "elysia";
import { booksApi } from "./books/books";
import { prepareConnection, setupConnection } from "./setup/connection.setup";
import { deriveBooks, setupBooks } from "./setup/book.setup";
import { setupUserId } from "./setup/user-id.setup";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { authApi } from "./auth/auth";
import { setupUserInfo } from "./setup/user.setup";

export async function buildApi() {
    const connection = await prepareConnection();
    const api = new Elysia({ prefix: '/api' })
        .use(jwt({
            name: 'jwt',
            secret: process.env["JWT_SECRET"] ?? 'jjookkkkkkkkkkkkkke'
        }))
        .use(bearer())
        .use(setupConnection(connection))

    api.use(setupUserInfo).use(authApi)

    const authorizedApp = api.use(setupUserId);

    authorizedApp.use(setupBooks)
        .group('/books', app => app.use(deriveBooks).use(booksApi));

    return api
}