import { LocalBookFileLister } from "./LocalBookFileLister"
import { BookFileManager, BookFileManagerType } from "./BookFileManager"
import { LocalBookFileUploader } from "./LocalBookFileUploader"


export function createBookFileManager<T = BookFileManagerType.Local>(type: T, localPath: string): BookFileManager;
export function createBookFileManager<T extends BookFileManagerType>(type: T, ...args: any[]): BookFileManager {
    switch (type) {
        case BookFileManagerType.Local:
            return new BookFileManager(BookFileManagerType.Local, new LocalBookFileLister(args[0]), new LocalBookFileUploader(args[0]))
        default:
            throw new Error(`Unknown BookFileListerType: ${type}`)
    }
}
