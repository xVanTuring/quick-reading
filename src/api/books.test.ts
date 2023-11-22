import { beforeAll, describe, expect, it, } from 'bun:test';
import Elysia from 'elysia';
import fs from 'fs/promises';
import path from 'path';
import { buildBunFormBody, buildBunRequestBody } from '../util/test/elysia';
import { SurrealDescribe } from '../util/test/surreal';
import { BookData, buildBooksApi } from './books';
import { prepareTempFolder } from '../util/test/temps';
import { prepareResource } from './setup';


SurrealDescribe("e2e: Books", () => {
    beforeAll(async () => {
        const randomFolderName = await prepareTempFolder("BooksAPI");
        process.env["BOOK_STORAGE_PATH"] = randomFolderName
    });

    async function buildApp() {
        const resource = await prepareResource()
        return buildBooksApi(resource);
    }

    async function getExistingBook(app: Elysia, bookId: string) {
        const res = await app.handle(new Request(`http://localhost/books/${bookId}`))
            .then(res => res.json<BookData>())
        return res;
    }

    async function deleteBook(app: Elysia, bookId: string) {
        const res = await app.handle(new Request(`http://localhost/books/${bookId}`, {
            method: "DELETE"
        })).then(res => res.json<{}>())
        return res;
    }
    async function updateBookProgress(app: Elysia, bookId: string, progress: number) {
        const response = await app.handle(buildBunRequestBody(`http://localhost/books/${bookId}/progress`,
            "POST", {
            page: progress
        }));
        const text = await response.text();
        if (!response.ok) {
            console.log(text)
        }
        expect(response.ok).toBe(true)
        return JSON.parse(text);
    }
    async function selectFileFromTestFiles() {
        const testFileFolderPath = "./testfiles/good";
        const testBookPaths: string[] = []
        for (const fileName of await fs.readdir(testFileFolderPath)) {
            if (fileName.endsWith(".pdf")) {
                testBookPaths.push(path.join(testFileFolderPath, fileName))
            }
        }
        if (testBookPaths.length == 0) {
            throw Error(`No Test books found in ${testFileFolderPath}`)
        }
        return testBookPaths[Math.floor(Math.random() * testBookPaths.length)]
    }
    async function addABook(app: Elysia, title = "Some Book", filePath = "testfiles/good/diaz the dictator.pdf") {
        const res = await app.handle(buildBunFormBody("http://localhost/books", "POST", {
            title
        }, filePath));
        return res.json<{ id: string; }>();
    }
    async function addBadBook(app: Elysia) {
        return app.handle(buildBunFormBody("http://localhost/books", "POST", {
            title: "Some Book"
        }, "testfiles/bad/bad.pdf"));
    }
    describe("List Books", () => {
        it("no books", async () => {
            const app = await buildApp();
            const response = await app.handle(new Request('http://localhost/books'));
            expect(response.ok).toBeTrue()
            expect(await response.json<[]>()).toStrictEqual([])
        })
        it("multiple books", async () => {
            const app = await buildApp();
            for (let index = 0; index < 10; index++) {
                const response = await addABook(app as any);
                expect(response.id).toBeString();
            }
            const res = await app.handle(new Request('http://localhost/books')).then(res => res.json<BookData[]>())
            expect(res.length).toStrictEqual(10)
        })
    })

    it("Get non-existing Book", async () => {
        const app = await buildApp();
        const notFoundResponse = await app.handle(new Request(`http://localhost/books/nnnnnn`))
        expect(notFoundResponse.ok).toBe(false)
        expect(notFoundResponse.status).toBe(404)
    })
    it("Delete existing Book", async () => {
        const app = await buildApp();
        const response = await addABook(app as any);
        expect(response.id).toBeDefined();
        const bookInfo = await getExistingBook(app as any, response.id);
        expect(bookInfo).toBeDefined()
        const deleteResponse = await deleteBook(app as any, response.id)
        expect(deleteResponse).toStrictEqual({})

        const notFoundResponse = await app.handle(new Request(`http://localhost/books/${response.id}`))
        expect(notFoundResponse.ok).toBe(false)
        expect(notFoundResponse.status).toBe(404)

    })
    it("Delete non-existing Book", async () => {
        const app = await buildApp();
        const deleteResponse = await app.handle(new Request(`http://localhost/books/adasdsd`, {
            method: "DELETE"
        }))
        expect(deleteResponse.ok).toBe(false)
        expect(deleteResponse.status).toBe(404)

    })

    it("Update date progress", async () => {
        const app = await buildApp()
        const response = await addABook(app as any);

        const book = await getExistingBook(app as any, response.id);
        expect(book.readingPage).toBe(0)

        const data = await updateBookProgress(app as any, response.id, 50)
        expect(data).toEqual({});

        const newBook = await getExistingBook(app as any, response.id);
        expect(newBook.readingPage).toBe(50)
    })

    it("Add multiple books", async () => {
        const app = await buildApp()
        for (let index = 0; index < 10; index++) {
            const response = await addABook(app as any);
            expect(response.id).toBeString();
        }
    })
    it("Add book and get it", async () => {
        const app = await buildApp();
        const bookAdded = await addABook(app as any, "A Book", await selectFileFromTestFiles());

        const res = await getExistingBook(app as any, bookAdded.id);
        expect(res.id).toBe(bookAdded.id);
        expect(res.title).toBe("A Book");
        expect(res.readingPage).toBe(0);
        expect(res.totalPage).toBeGreaterThan(0);
    });
    it("Add bad pdf", async () => {
        const app = await buildApp();
        const response = await addBadBook(app as any);
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        expect(await response.text()).toBeDefined();
    });
});