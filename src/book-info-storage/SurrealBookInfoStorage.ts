import assert from "assert";
import { BookInfo, BookInfoStorage } from "./BookInfoStorage";
import { SurrealConnection } from "../connection/surreal-connection";

export class SurrealBookInfoStorage implements BookInfoStorage {

    constructor(protected readonly surrealConnection: SurrealConnection) {
    }
    
    protected get db() {
        return this.surrealConnection.db
    }

    private connectionPromise: Promise<BookInfoStorage> | null = null;

    async ready(): Promise<BookInfoStorage> {
        if (this.surrealConnection.connected) {
            return this;
        }
        if (this.surrealConnection.isConnecting) {
            assert(this.connectionPromise != null);
            return this.connectionPromise;
        }
        assert(this.connectionPromise == null);
        this.connectionPromise = this.surrealConnection.ready().then(() => this);
        return this.connectionPromise;
    }

    async deleteBookInfo(id: string): Promise<void> {
        await this.db.delete(id)
    }

    public get connected() {
        return this.surrealConnection.connected;
    }
    async createBookInfo(info: Omit<BookInfo, 'id'>): Promise<string> {
        const result = await this.db.create('bookinfo', info)
        return result[0].id
    }
    listBooks(): Promise<BookInfo[]> {
        return this.db.select("bookinfo")
    }
    async getBookInfo(id: string): Promise<BookInfo | null> {
        const books: BookInfo[] | BookInfo = await this.db.select(id)
        if (Array.isArray(books)) {
            if (books.length == 0) {
                return null
            }
            return books[0]
        }
        return books
    }
    async updateBookInfo(id: string, info: Partial<BookInfo>): Promise<void> {
        await this.db.merge(id, info)
    }

}