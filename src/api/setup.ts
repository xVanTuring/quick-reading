import Elysia from "elysia";
import { SurrealBookInfoStorage } from "../book-info-storage";
import { createBookFileManager } from "../book-file-storage";
import { BookFileManager, BookFileManagerType } from "../book-file-storage/BookFileManager";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { BookInfoStorage } from "../book-info-storage/BookInfoStorage";

const RETRY_CONNECTION = 10;
export async function prepareResource() {
    const bookInfoStorage = createBookInfoStorageFromEnv();
    const bookFileManager = createBookFileManagerFromEnv();
    let pdfium: PDFiumLibrary | null = null;
    try {
        pdfium = await PDFiumLibrary.init();
    } catch (error) {
        console.error("error when init pdfium")
        console.error(error)
        throw new Error("Unable to initial pdfium")
    }
    for (let index = 0; index < RETRY_CONNECTION; index++) {
        try {
            await bookInfoStorage.ready();
            break;
        } catch (error) {
            console.error("error when connect to service")
            console.error(error)
            console.error(`Sleeping 2s. Retrying ${index + 1}/${RETRY_CONNECTION}`)
            await Bun.sleep(2000);
        }
    }
    if (!bookInfoStorage.connected) {
        throw new Error("Unable to connect to book info storage")
    }
    return {
        pdfium,
        bookInfoStorage,
        bookFileManager
    }
}

export interface SetupResource {
    pdfium: PDFiumLibrary, bookInfoStorage: BookInfoStorage, bookFileManager: BookFileManager
}

export const setup = ({ pdfium, bookInfoStorage, bookFileManager }: SetupResource) => {
    return (app: Elysia) => {
        return app.state('storage', {
            bookInfoStorage,
            bookFileManager
        }).decorate('pdfium', pdfium)
    }
}


function createBookFileManagerFromEnv() {
    const bookStoragePath = process.env["BOOK_STORAGE_PATH"] ?? './public/books';
    return createBookFileManager(BookFileManagerType.Local, bookStoragePath);
}
function createBookInfoStorageFromEnv() {
    const dbUrl = process.env["SURREAL_URL"] ?? 'ws://localhost:8000';
    const dbName = process.env["SURREAL_NAME"] ?? 'root';
    const dbPass = process.env["SURREAL_PASS"] ?? 'root';
    const dbNS = process.env["SURREAL_NS"] ?? 'test';
    const dbDB = process.env["SURREAL_DB"] ?? 'test';
    const bookInfoStorage = new SurrealBookInfoStorage({
        username: dbName,
        password: dbPass,
        database: dbDB,
        namespace: dbNS,
        url: dbUrl,
    });
    return bookInfoStorage;
}

