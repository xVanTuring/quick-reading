import { Elysia, } from "elysia";
import { buildBooksApi } from "./books";


export const api = new Elysia({ prefix: '/api' });
const books = buildBooksApi();
await books.modules
api.use(books)