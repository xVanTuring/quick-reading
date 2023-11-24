import assert from "assert";
import { SurrealConnection } from "../connection/surreal-connection";
import { UserInfo, UserInfoStorage } from "./UserInfoStorage";

export class SurrealUserInfoStorage implements UserInfoStorage {
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

    get connected() {
        return this.surrealConnection.connected
    }

    toUser(userId: string): UserInfoStorage {
        const clone = new SurrealUserInfoStorage(this.surrealConnection);
        clone._currentUser = userId;
        return clone;
    }

    private connectionPromise: Promise<SurrealUserInfoStorage> | null = null;

    get tableName() {
        return 'user_info'
    }

    async ready(): Promise<SurrealUserInfoStorage> {
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

    async prepare() {
        await this.db.query(`DEFINE INDEX userNameIndex ON TABLE ${this.tableName} COLUMNS username UNIQUE;`)
    }

    async getUserInfo(): Promise<UserInfo | null> {
        const result = await this.db.select(this.currentUser)
        return result
    }

    async getUserInfoByName(name: string): Promise<UserInfo | null> {
        const result = await this.db.query(`select * from ${this.tableName} where username=$username`, { username: name })
        if (result.length == 0) {
            return null
        }
        return result[0]
    }

    async createUserInfo(userInfo: Omit<UserInfo, "id">): Promise<{ id: string }> {
        const result = await this.db.create(this.tableName, { ...userInfo })
        return { id: result[0].id }
    }

    async updateUserInfo(userInfo: Partial<Omit<UserInfo, 'id'>>): Promise<void> {
        await this.db.query(`update $id MERGE $data`, {
            id: this.currentUser,
            data: userInfo
        })
    }

    async deleteUserInfo(): Promise<void> {
        await this.db.query(`delete $id`, { id: this.currentUser })
    }
}