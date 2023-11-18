import { BookFileLister } from "./BookFileLister"
import { LocalBookFileLister } from "./LocalBookFileLister"

export enum BookFileListerType {
    Local = "Local",
}

export function createBookFileLister<T = BookFileListerType.Local>(type: T, localPath: string): BookFileLister;
export function createBookFileLister<T extends BookFileListerType>(type: T, ...args: any[]): BookFileLister {
    switch (type) {
        case BookFileListerType.Local:
            return new LocalBookFileLister(args[0])
        default:
            throw new Error(`Unknown BookFileListerType: ${type}`)
    }
}
