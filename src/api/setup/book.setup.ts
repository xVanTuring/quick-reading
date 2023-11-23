import { SurrealBookInfoStorage } from "../../book-info-storage";
import { createBookFileManager } from "../../book-file-storage";
import { BookFileManagerType } from "../../book-file-storage/BookFileManager";
import { BookInfoStorage, BookInfoStorageType } from "../../book-info-storage/BookInfoStorage";
import type { ConnectionMap, SetupConnection } from "./connection.setup";
import { MergeElysiaDecorator } from "../../util/type/elysia-merge";
import { SetupUserId } from "./user-id.setup";

export const setupBooks = (app: MergeElysiaDecorator<SetupConnection, SetupUserId>) => {
    return app.decorate((decorators) => {
        const bookInfoStorage = createBookInfoStorageFromEnv(decorators.connections);
        const bookFileManager = createBookFileManagerFromEnv();
        return {
            ...decorators,
            bookInfoStorage,
            bookFileManager
        }
    });
}
export const deriveBooks = (app: SetupBooks) => {
    return app.derive((decorators) => {
        const bookInfoStorage = decorators.bookInfoStorage.toUser(decorators.userId);
        return { ...decorators, bookInfoStorage }
    })
}
export type SetupBooks = ReturnType<typeof setupBooks>;

function createBookFileManagerFromEnv() {
    const bookStoragePath = process.env["BOOK_STORAGE_PATH"] ?? './public/books';
    return createBookFileManager(BookFileManagerType.Local, bookStoragePath);
}
function createBookInfoStorageFromEnv(connectionMap: ConnectionMap): BookInfoStorage {
    switch (process.env["BOOK_INFO_STORAGE_TYPE"]) {
        case BookInfoStorageType.Surreal:
            if (connectionMap.surrealConnection == null) {
                throw Error("Unable to create book info storage: surreal connection is null");
            }
            const bookInfoStorage = new SurrealBookInfoStorage(connectionMap.surrealConnection);
            return bookInfoStorage;
        default:
            throw Error("Unknown book info storage type, please provide env `BOOK_INFO_STORAGE_TYPE`")
    }
}

