export interface BookFileUploader {
    uploadFormFilePath(tempPath: string): Promise<string>;
    uploadFormArrayBuffer(buffer: ArrayBuffer): Promise<string>;
    deleteFile(fileName: string): Promise<void>
}
