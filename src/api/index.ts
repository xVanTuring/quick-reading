import { Elysia } from "elysia";
import { booksApi } from "./books/books";
import { prepareConnection, setupConnection } from "./setup/connection.setup";
import { deriveBooks, setupBooks } from "./setup/book.setup";
import { setupUserId } from "./setup/user-id.setup";

export async function buildApi() {
    const connection = await prepareConnection();
    const api = new Elysia({ prefix: '/api' }).use(setupConnection(connection))
        .use(setupUserId);

    api.use(setupBooks)
        .group('/books', app => app.use(deriveBooks).use(booksApi));

    return api
}