export interface FileInfo {
    name: string;
    size: number;
    path: {
        local: string;
    };
}
/**
 * 文件存储大概的设计是，单层类似于Oss的设计，有一个文件列表器，可以列出所有文件，也可以列出某个文件的信息，
 * 不存在实际的文件夹
 */
export interface BookFileLister {
    getFiles(): Promise<string[]>;
    getFileInfo(fileName: string): Promise<FileInfo>;
    getSupportedFileExtensions(): string[];
}
