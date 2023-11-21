import Elysia from "elysia";
import { SurrealBookInfoStorage } from "../book-info-storage";
import { createBookFileManager } from "../book-file-storage";
import { BookFileManagerType } from "../book-file-storage/BookFileManager";
import { PDFiumLibrary } from "@hyzyla/pdfium";


export const setup = async (app: Elysia) => {
    const bookInfoStorage = createBookInfoStorageFromEnv();
    const bookFileManager = createBookFileManagerFromEnv();
    let pdfium: PDFiumLibrary | null = null;
    try {
        pdfium = await PDFiumLibrary.init();
    } catch (error) {
        console.error("error when init pdfium")
        console.error(error)
    }
    try {
        await bookInfoStorage.ready();
    } catch (error) {
        console.error("error when connect to service")
        console.error(error)
    }
    return app.state('storage', {
        bookInfoStorage,
        bookFileManager
    }).decorate('pdfium', pdfium!)
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

