import fs from 'fs/promises';
import path from 'path'
import { BookFileUploader } from "./BookFileUploader";
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890abcdefhijklmnopqrstuvwxyz', 10)

export class LocalBookFileUploader implements BookFileUploader {
    constructor(private readonly localFolderPath: string) {

    }
    async deleteFile(fileName: string): Promise<void> {
        const filePath = path.join(this.localFolderPath, fileName)
        if (!(await fs.exists(filePath))) {
            return
        }
        await fs.unlink(filePath)
    }
    private buildName() {
        const randomFileName = nanoid();
        const fileName = `${randomFileName}.pdf`;
        return fileName
    }
    async uploadFormArrayBuffer(buffer: ArrayBuffer): Promise<string> {
        const fileName = this.buildName()
        await fs.writeFile(path.join(this.localFolderPath, fileName), buffer)
        return fileName
    }
    async uploadFormFilePath(tempPath: string): Promise<string> {
        const fileName = this.buildName();
        await fs.copyFile(tempPath, path.join(this.localFolderPath, fileName))
        return fileName
    }

}
