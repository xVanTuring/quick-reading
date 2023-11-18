import { BookInfo, BookInfoStorage } from "./BookInfoStorage";
import { Surreal } from 'surrealdb.node'

export class SurrealBookInfoStorage implements BookInfoStorage {
    db: Surreal;
    constructor(private dbConnection: {
        url: string,
        username: string;
        password: string;
        namespace: string;
        database: string
    }) {
        this.db = new Surreal();
    }
    async connect(): Promise<void> {
        await this.db.connect(this.dbConnection.url);
        await this.db.signin({
            username: this.dbConnection.username,
            password: this.dbConnection.password
        });
        await this.db.use({
            ns: this.dbConnection.namespace,
            db: this.dbConnection.database,
        })
    }
    async createBookInfo(info: Omit<BookInfo, 'id'>): Promise<string> {
        const result = await this.db.create('bookinfo', info)
        return result[0].id
    }
    listBooks(): Promise<BookInfo[]> {
        return this.db.select("bookinfo")
    }
    getBookInfo(id: string): Promise<BookInfo | null> {
        return this.db.select(id)
    }
    async updateBookInfo(id: string, info: Partial<BookInfo>): Promise<void> {
        await this.db.merge(id, info)
    }

}