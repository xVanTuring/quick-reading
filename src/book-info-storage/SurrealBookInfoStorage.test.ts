import { SurrealBookInfoStorage } from "./SurrealBookInfoStorage";
import { BookInfo } from "./BookInfoStorage";
import { describe, beforeEach, expect, it, afterEach } from 'bun:test'
import { BookFileListerType } from "../book-file-storage";
import { Subprocess } from "bun";
describe("SurrealBookInfoStorage", () => {
    let storage: SurrealBookInfoStorage;
    let surrealDbProcess: Subprocess
    function startSurreal() {
        return Bun.spawn([
            "surreal", "start", "--no-banner", "-l", "none",
            "--user", "root",
            "--pass", "root",
            "--bind", "0.0.0.0:8180"])
    }
    function buildABook(): Omit<BookInfo, 'id'> {
        return {
            title: "Test Book",
            file: {
                fileName: "Book.pdf",
                storageType: BookFileListerType.Local
            },
            progress: {
                page: 0,
            },
            totalPages: 140
        };
    }

    beforeEach(async () => {
        surrealDbProcess = startSurreal()
        // make sure surreal is up and running
        await Bun.sleep(200);
        // Initialize the storage instance with a mock dbConnection
        storage = new SurrealBookInfoStorage({
            url: "ws://127.0.0.1:8180",
            username: "root",
            password: "root",
            namespace: "test",
            database: "test",
        });
        await storage.connect();
    });

    afterEach(async () => {
        surrealDbProcess.kill()
        await Bun.sleep(200);

    })


    describe("createBookInfo", () => {
        it("should create a new book info", async () => {
            const bookInfo: Omit<BookInfo, 'id'> = buildABook();
            // Test the createBookInfo method
            let bookId = await storage.createBookInfo(bookInfo);
            // Assert that the book info is created successfully
            const createdBookInfo = await storage.getBookInfo(bookId);
            expect(createdBookInfo).toEqual({ ...bookInfo, id: bookId });
        });
    });

    describe("listBooks", () => {
        it("should list all books: empty", async () => {
            // Test the listBooks method
            const books = await storage.listBooks();
            // Assert that the list of books is not empty
            expect(books.length).toBe(0);
        });
        it("should list all books: one book", async () => {
            const bookInfo: Omit<BookInfo, 'id'> = buildABook();
            await storage.createBookInfo(bookInfo);
            const books = await storage.listBooks();
            expect(books.length).toBe(1);
        });
    });



    describe("updateBookInfo", () => {
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

