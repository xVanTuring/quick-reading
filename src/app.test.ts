import { describe, expect, it } from 'bun:test'
import { buildApp } from './app'
import { BookData } from './books';
import Elysia from 'elysia';

function buildBunRequestBody(url: string, method: string, body: object) {
    return new Request(url, {
        method: method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    })
}
function buildBookUpdateUrl(bookId: string) {
    return `http://localhost/api/books/${bookId}/progress`
}
function buildBookListUrls() {
    return `http://localhost/api/books`
}
function buildBookGetUrl(bookId: string) {
    return `http://localhost/api/books/${bookId}`
}
describe('Elysia', () => {
    function checkBookIsValid(book: BookData) {
        // TODO: use t.Object to check        
        expect(book["id"]).toBeDefined();
        expect(book["title"]).toBeDefined();
        expect(book["readingPage"]).toBeInteger();
        expect(book["file"]["localPath"]).toBeString();
    }
    async function requestAllBooks(app: Elysia) {
        const res = await app.handle(
            new Request(buildBookListUrls(), { method: 'GET' })
        );
        return res.json<BookData[]>();
    }
    async function requestBook(app: Elysia, bookId: string) {
        const res = await app.handle(
            new Request(buildBookGetUrl(bookId), { method: 'GET' })
        );
        return res.json<BookData>();
    }
    async function updateBookProgress(app: Elysia, bookId: string, progress: number) {
        const res = await app
            .handle(buildBunRequestBody(buildBookUpdateUrl(bookId), 'POST', { page: 10 }));
        return res.json<{}>()
    }
    it('list books', async () => {
        const app = buildApp();
        const books = await requestAllBooks(app);

        expect(Array.isArray(books)).toBe(true);
        books.forEach(book => {
            checkBookIsValid(book);
        });
    })

    it('update book reading ', async () => {
        const app = buildApp();
        const books = await requestAllBooks(app);
        expect(books.length).toBeGreaterThan(0);
        const toBeUpdatedBook = books[0];

        const updateUrl = buildBookUpdateUrl(toBeUpdatedBook.id);
        const updateResponse = await updateBookProgress(app, toBeUpdatedBook.id, 10);
        expect(updateResponse).toStrictEqual({});

        const book = await requestBook(app, toBeUpdatedBook.id);
        expect(book.readingPage).toBe(10);

    })
})