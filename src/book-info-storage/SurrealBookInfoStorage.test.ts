import { SurrealBookInfoStorage } from "./SurrealBookInfoStorage";
import { BookInfo } from "./BookInfoStorage";
import { describe, beforeEach, expect, it } from 'bun:test'

import { SurrealDescribe } from "../util/test/surreal";
import { BookFileManagerType } from "../book-file-storage/BookFileManager";

SurrealDescribe("unit: SurrealBookInfoStorage", () => {

    let storage: SurrealBookInfoStorage;
    beforeEach(async () => {
        storage = new SurrealBookInfoStorage({
            url: process.env["SURREAL_URL"]!,
            username: "root",
            password: "root",
            namespace: "test",
            database: "test",
        });
        await storage.ready();
    });

    function buildABook(): Omit<BookInfo, 'id'> {
        return {
            title: "Test Book",
            file: {
                fileName: "Book.pdf",
                storageType: BookFileManagerType.Local
            },
            progress: {
                page: 0,
            },
            totalPage: 140
        };
    }

    describe("createBookInfo", () => {
        it("should create a new book info", async () => {
            const bookInfo: Omit<BookInfo, 'id'> = buildABook();
            let bookId = await storage.createBookInfo(bookInfo);
            const createdBookInfo = await storage.getBookInfo(bookId);
            expect(createdBookInfo).toEqual({ ...bookInfo, id: bookId });
        });
    });
    describe("deleteBookInfo", () => {
        it("should create a new book info", async () => {
            const bookInfo: Omit<BookInfo, 'id'> = buildABook();
            let bookId = await storage.createBookInfo(bookInfo);
            await storage.deleteBookInfo(bookId)
            const createdBookInfo = await storage.getBookInfo(bookId);
            expect(createdBookInfo).toBeNull();
        });
    });


    describe("List Books", () => {
        it("should list all books: empty", async () => {
            const books = await storage.listBooks();
            expect(books.length).toBe(0);
        });
        it("should list all books: one book", async () => {
            const bookInfo: Omit<BookInfo, 'id'> = buildABook();
            await storage.createBookInfo(bookInfo);
            const books = await storage.listBooks();
            expect(books.length).toBe(1);
        });
    });



    describe("Update Book Info", () => {
        it("should update book info by id", async () => {
            const bookInfo = buildABook();
            const bookId = await storage.createBookInfo(bookInfo);
            const updatedBookInfo: Partial<BookInfo> = {
                title: "New Title 7781"
            };
            await storage.updateBookInfo(bookId, updatedBookInfo);
            const retrievedBookInfo = await storage.getBookInfo(bookId);
            expect(retrievedBookInfo?.title).toEqual(updatedBookInfo.title as any);
        });
    });
});

