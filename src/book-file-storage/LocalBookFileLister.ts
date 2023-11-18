import { BookFileLister, FileInfo } from "./BookFileLister";
import fs from 'fs/promises';
import path from 'path'
export class LocalBookFileLister implements BookFileLister {
    constructor(private readonly localFolderPath: string) {

    }
    /**
     * @throws {Error} if the localFolderPath does not exist
     */
    async getFiles(): Promise<string[]> {
        const files = await fs.readdir(this.localFolderPath);
        return files.filter(file => file.endsWith(".pdf"));
    }

    async getFileInfo(fileName: string): Promise<FileInfo> {
        const filePath = path.join(this.localFolderPath, fileName);
        let fileStat = await fs.stat(filePath);
        return {
            name: fileName,
            path: {
                local: filePath
            },
            size: fileStat.size,
        }
    }
    getSupportedFileExtensions(): string[] {
        return ["pdf"]
    }

}
