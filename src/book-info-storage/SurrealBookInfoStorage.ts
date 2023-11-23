import assert from "assert";
import { BookInfo, BookInfoStorage } from "./BookInfoStorage";
import { SurrealConnection } from "../connection/surreal-connection";

export class SurrealBookInfoStorage implements BookInfoStorage {

    constructor(protected readonly surrealConnection: SurrealConnection) {
    }

    protected get db() {
        return this.surrealConnection.db
    }

    private _currentUser: string | null = null

    get currentUser() {
        if (this._currentUser == null) {
            throw new Error("current user is null");
        }
        return this._currentUser
    }

    toUser(userId: string): BookInfoStorage {
        const clone = new SurrealBookInfoStorage(this.surrealConnection);
        clone._currentUser = userId;
        return clone;
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
        await this.db.query(`delete $id WHERE owner=$owner`, { id, owner: this.currentUser })
    }

    public get connected() {
        return this.surrealConnection.connected;
    }

    async createBookInfo(info: Omit<BookInfo, 'id' | 'owner'>): Promise<string> {
        const result = await this.db.create('bookinfo', { ...info, owner: this.currentUser })
        return result[0].id
    }

    listBooks(): Promise<BookInfo[]> {
        return this.db.query("select * from bookinfo where owner=$owner", {
            owner: this.currentUser
        });
    }

    async getBookInfo(id: string): Promise<BookInfo | null> {
        const books: BookInfo[] | BookInfo = await this.db.query("select * from $id where owner=$owner", { id, owner: this.currentUser })
        if (Array.isArray(books)) {
            if (books.length == 0) {
                return null
            }
            return books[0]
        }
        return books
    }

    async updateBookInfo(id: string, info: Partial<BookInfo>): Promise<void> {
        await this.db.query(`update $id MERGE $data where owner=$owner`, {
            id,
            owner: this.currentUser,
            data: info
        })
    }

}