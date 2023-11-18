import { BookFileListerType } from "../book-file-storage";

export interface BookInfo {
    id: string;
    title: string;
    file: {
        fileName: string;
        storageType: BookFileListerType;
    },
    totalPages: number;
    progress: {
        page: number
    },
}
export interface BookInfoStorage {
    listBooks(): Promise<BookInfo[]>;
    connect(): Promise<void>;
    getBookInfo(id: string): Promise<BookInfo | null>;
    updateBookInfo(id: string, info: Partial<BookInfo>): Promise<void>;
    createBookInfo(info: Omit<BookInfo, 'id'>, id?: string): Promise<string>;
}