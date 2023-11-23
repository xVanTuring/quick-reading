import assert from "assert";
import { Surreal } from "surrealdb.node";
import { Connection } from "./connection";

export class SurrealConnection implements Connection {
    readonly db: Surreal;
    constructor(private dbConnection: {
        url: string,
        username: string;
        password: string;
        namespace: string;
        database: string
    }) {
        this.db = new Surreal();
    }
    private _connected: boolean = false;
    public get connected() {
        return this._connected;
    }
    public get isConnecting() {
        return this._isConnecting;
    }
    private _isConnecting: boolean = false;
    private connectionPromise: Promise<SurrealConnection> | null = null;

    async ready(): Promise<SurrealConnection> {
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

    private async connect(): Promise<void> {
        if (this.connected) {
            return
        }
        this._isConnecting = true;
        await this.db.connect(this.dbConnection.url);
        await this.db.signin({
            username: this.dbConnection.username,
            password: this.dbConnection.password
        });
        await this.db.use({
            ns: this.dbConnection.namespace,
            db: this.dbConnection.database,
        })
        this._isConnecting = false;
        this._connected = true;
    }
}