import { beforeEach, expect, it, } from "bun:test";
import { SurrealDescribe } from "../util/test/surreal";
import { SurrealUserInfoStorage } from "./SurrealUserInfoStorage";
import { SurrealConnection } from "../connection/surreal-connection";
import { UserInfo } from "./UserInfoStorage";

SurrealDescribe("unit: SurrealUserInfoStorage", async () => {
    let infoStorage: SurrealUserInfoStorage;

    beforeEach(async () => {
        const surrealConnection = new SurrealConnection({
            url: process.env["SURREAL_URL"]!,
            username: "root",
            password: "root",
            namespace: "test",
            database: "test",
        });
        infoStorage = new SurrealUserInfoStorage(surrealConnection);
        await infoStorage.ready();
        await infoStorage.prepare();
    });

    async function createUser() {
        const userInfo: Omit<UserInfo, 'id'> = {
            username: "John Doe",
            password: await Bun.password.hash("password")
        };

        const { id } = await infoStorage.createUserInfo(userInfo);
        return { id, userInfo };
    }

    it("should create a new user info", async () => {
        const { id, userInfo } = await createUser()
        expect(id).toBeString()
        const fetchedUserInfo = await infoStorage.getUserInfoByName(userInfo.username);
        expect(fetchedUserInfo?.id).toBe(id);
        expect(fetchedUserInfo?.username).toBe(userInfo.username)
        expect(fetchedUserInfo?.password).toBe(userInfo.password)
    });

    it("should update an existing user info", async () => {
        const { id } = await createUser()


        const updatedUserInfo = {
            password: await Bun.password.hash("password2")
        };

        const userStorage = infoStorage.toUser(id);

        await userStorage.updateUserInfo(updatedUserInfo);

        const fetchedUserInfo = await userStorage.getUserInfo();
        expect(fetchedUserInfo?.password).toEqual(updatedUserInfo.password);
    });

    it("should delete an existing user info", async () => {
        const { id } = await createUser();

        const userStorage = infoStorage.toUser(id);
        await userStorage.deleteUserInfo();

        const deletedUserInfo = await userStorage.getUserInfo();
        expect(deletedUserInfo).toBeNull();
    });

    it("shall not create  two user with same name", async () => {
        await createUser();
        try {
            await createUser();
            expect(false).toBe(true)
        } catch (error) {
            expect(error).toBeDefined()
        }

    })

});
