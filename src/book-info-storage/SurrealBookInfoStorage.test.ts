import { SurrealBookInfoStorage } from "./SurrealBookInfoStorage";
import { BookInfo, BookInfoStorage } from "./BookInfoStorage";
import { beforeEach, describe, expect, it } from 'bun:test'

import { SurrealDescribe } from "../util/test/surreal";
import { BookFileManagerType } from "../book-file-storage/BookFileManager";
import { SurrealConnection } from "../connection/surreal-connection";

SurrealDescribe("unit: SurrealBookInfoStorage", () => {
    let storage: BookInfoStorage;
    beforeEach(async () => {
        const surrealConnection = new SurrealConnection({
            url: process.env["SURREAL_URL"]!,
            username: "root",
            password: "root",
            namespace: "test",
            database: "test",
        })
        storage = new SurrealBookInfoStorage(surrealConnection).toUser("admin");
        await storage.ready();
    });

    function createBookInfo(): Omit<BookInfo, 'id' | 'owner'> {
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


    it("shall be connected", async () => {
        expect(storage.connected).toBeTrue()
    });

    it("shall create a new book", async () => {
        const bookInfo: Omit<BookInfo, 'id' | 'owner'> = createBookInfo();
        let bookId = await storage.createBookInfo(bookInfo);
        const createdBookInfo = await storage.getBookInfo(bookId);
        expect(createdBookInfo).toEqual({ ...bookInfo, id: bookId, owner: storage.currentUser });
    });

    it("shall not access book when deleted", async () => {
        const bookInfo: Omit<BookInfo, 'id' | 'owner'> = createBookInfo();
        let bookId = await storage.createBookInfo(bookInfo);
        await storage.deleteBookInfo(bookId)
        const createdBookInfo = await storage.getBookInfo(bookId);
        expect(createdBookInfo).toBeNull();
    });

    it("shall list all its book: empty", async () => {
        const books = await storage.listBooks();
        expect(books.length).toBe(0);
    });

    it("shall list all its book", async () => {
        const bookInfo: Omit<BookInfo, 'id' | 'owner'> = createBookInfo();
        await storage.createBookInfo(bookInfo);
        const books = await storage.listBooks();
        expect(books.length).toBe(1);
    });

    it("shall update its book", async () => {
        const bookInfo = createBookInfo();
        const bookId = await storage.createBookInfo(bookInfo);
        const updatedBookInfo: Partial<BookInfo> = {
            title: "New Title 7781"
        };
        await storage.updateBookInfo(bookId, updatedBookInfo);
        const retrievedBookInfo = await storage.getBookInfo(bookId);
        expect(retrievedBookInfo?.title).toEqual(updatedBookInfo.title as any);
    });

    describe("two user shall be isolated", () => {
        async function createTwoUserAndBooks(): Promise<[BookInfoStorage, BookInfoStorage, string, string]> {
            const user1Storage = storage.toUser("user1")
            const user2Storage = storage.toUser("user2")
            const bookInfo: Omit<BookInfo, 'id' | 'owner'> = createBookInfo();
            const id1 = await user1Storage.createBookInfo(bookInfo);
            const id2 = await user2Storage.createBookInfo(bookInfo);
            return [user1Storage, user2Storage, id1, id2]
        }
        async function getTwoUserBooks([user1Storage, user2Storage]: [BookInfoStorage, BookInfoStorage]) {
            return Promise.all([user1Storage.listBooks(), user2Storage.listBooks()])
        }
        it("shall not see each other's books", async () => {
            const [user1Storage, user2Storage] = await createTwoUserAndBooks();

            const [user1Books, user2Books] = await getTwoUserBooks([user1Storage, user2Storage]);
            expect(user1Books.length).toBe(1);
            expect(user2Books.length).toBe(1);
        })
        it("shall not inspect other's books", async () => {
            const [user1Storage, user2Storage, id1, id2] = await createTwoUserAndBooks();
            const book1 = await user1Storage.getBookInfo(id2)
            const book2 = await user2Storage.getBookInfo(id1)
            expect(book1).toBe(null)
            expect(book2).toBe(null)
        })
        it("shall not delete other's books", async () => {
            const [user1Storage, user2Storage, id1, id2] = await createTwoUserAndBooks();
            await user2Storage.deleteBookInfo(id1)
            await user1Storage.deleteBookInfo(id2)

            const [user1Books, user2Books] = await getTwoUserBooks([user1Storage, user2Storage]);
            expect(user1Books.length).toBe(1);
            expect(user2Books.length).toBe(1);
        })

        it("shall not change other's books", async () => {
            const [user1Storage, user2Storage, id1, id2] = await createTwoUserAndBooks();
            await user2Storage.updateBookInfo(id1, {
                progress: { page: 60 }
            })
            await user1Storage.updateBookInfo(id2, {
                progress: { page: 40 }
            })
            for (const books of await getTwoUserBooks([user1Storage, user2Storage])) {
                expect(books.length).toBe(1);
                expect(books[0].progress.page).toBe(0);
            }
        })

    })
});

