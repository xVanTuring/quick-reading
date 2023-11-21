import { BookFileLister, FileInfo } from "./BookFileLister";
import fs from 'fs/promises';
import path from 'path'
export class LocalBookFileLister implements BookFileLister {
    private cache = new Map<string, FileInfo>();
    constructor(private readonly localFolderPath: string) {

    }
    async getPublicPath(fileName: string): Promise<string> {
        return `/public/books/${fileName}`;
    }

    public invalidCache(fileName: string) {
        this.cache.delete(fileName);
    }
    /**
     * @throws {Error} if the localFolderPath does not exist
     */
    async getFiles(): Promise<string[]> {
        const files = await fs.readdir(this.localFolderPath);
        return files.filter(file => file.endsWith(".pdf"));
    }

    async getFileInfo(fileName: string): Promise<FileInfo> {
        const cache = this.cache.get(fileName);
        if (cache != null) {
            return cache;
        }
        const filePath = path.join(this.localFolderPath, fileName);
        const fileStat = await fs.stat(filePath);
        const info = {
            name: fileName,
            path: {
                local: filePath
            },
            size: fileStat.size,
        };
        this.cache.set(fileName, info);
        return info
    }
    getSupportedFileExtensions(): string[] {
        return ["pdf"]
    }

}
