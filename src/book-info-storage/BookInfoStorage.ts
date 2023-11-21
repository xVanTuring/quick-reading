import { BookFileManagerType } from "../book-file-storage/BookFileManager";

export interface BookInfo {
    id: string;
    title: string;
    file: {
        fileName: string;
        storageType: BookFileManagerType;
    },
    totalPage: number;
    progress: {
        page: number
    },
}
export interface BookInfoStorage {
    listBooks(): Promise<BookInfo[]>;
    getBookInfo(id: string): Promise<BookInfo | null>;
    updateBookInfo(id: string, info: Partial<BookInfo>): Promise<void>;
    createBookInfo(info: Omit<BookInfo, 'id'>, id?: string): Promise<string>;
    deleteBookInfo(id: string): Promise<void>;
    ready(): Promise<BookInfoStorage>;
}