import assert from "assert";
import { BookInfo, BookInfoStorage } from "./BookInfoStorage";
import { Surreal } from 'surrealdb.node'

export class SurrealBookInfoStorage implements BookInfoStorage {
    protected db: Surreal;

    constructor(private dbConnection: {
        url: string,
        username: string;
        password: string;
        namespace: string;
        database: string
    }) {
        this.db = new Surreal();
    }

    private isConnecting = false;
    private connectionPromise: Promise<BookInfoStorage> | null = null;

    async ready(): Promise<BookInfoStorage> {
        if (this.connected) {
            return this;
        }
        if (this.isConnecting) {
            assert(this.connectionPromise != null);
            return this.connectionPromise;
        }
        assert(this.connectionPromise == null);
        this.connectionPromise = this.connect().then(() => this);
        return this.connectionPromise;
    }

    async deleteBookInfo(id: string): Promise<void> {
        await this.db.delete(id)
    }

    private _connected: boolean = false;
    public get connected() {
        return this._connected;
    }
    private async connect(): Promise<void> {
        if (this.connected) {
            return
        }
        this.isConnecting = true;
        await this.db.connect(this.dbConnection.url);
        await this.db.signin({
            username: this.dbConnection.username,
            password: this.dbConnection.password
        });
        await this.db.use({
            ns: this.dbConnection.namespace,
            db: this.dbConnection.database,
        })
        this.isConnecting = false;
        this._connected = true;
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