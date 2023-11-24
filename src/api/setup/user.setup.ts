import { SurrealUserInfoStorage } from "../../user-info-storage/SurrealUserInfoStorage";
import { UserInfoStorage, UserInfoStorageType } from "../../user-info-storage/UserInfoStorage";
import { ConnectionMap, SetupConnection } from "./connection.setup";

export const setupUserInfo = (app: SetupConnection) => {
    return app.decorate((decorators) => {
        const userInfoStorage = createSurrealInfoStorageFromEnv(decorators.connections);
        return {
            ...decorators,
            userInfoStorage
        }
    });
}
export type SetupUserInfo = ReturnType<typeof setupUserInfo>;

function createSurrealInfoStorageFromEnv(connectionMap: ConnectionMap): UserInfoStorage {
    switch (process.env["USER_INFO_STORAGE_TYPE"]) {
        case UserInfoStorageType.Surreal:
            if (connectionMap.surrealConnection == null) {
                throw Error("Unable to create book info storage: surreal connection is null");
            }
            return new SurrealUserInfoStorage(connectionMap.surrealConnection);

        default:
            throw Error("Unknown book info storage type, please provide env `BOOK_INFO_STORAGE_TYPE`")
    }
}