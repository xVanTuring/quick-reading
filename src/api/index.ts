import { Elysia, } from "elysia";
import { buildBooksApi } from "./books";
import { prepareResource } from "./setup";

export async function buildApi() {
    const api = new Elysia({ prefix: '/api' });
    const resource = await prepareResource();
    const books = buildBooksApi(resource);
    return api.use(books);
}