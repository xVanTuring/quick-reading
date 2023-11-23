import { Elysia, } from "elysia";
import { booksApi } from "./books/books";
import { prepareConnection, setup } from "./setup/setup";
import { setupBooks } from "./setup/book.setup";

export async function buildApi() {
    const api = new Elysia({ prefix: '/api' });
    const connection = await prepareConnection();
    return api.use(setup(connection)).use(setupBooks).group('/books', booksApi);
}