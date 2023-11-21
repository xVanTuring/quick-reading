import { BookFileLister } from "./BookFileLister";
import { BookFileUploader } from "./BookFileUploader";
export enum BookFileManagerType {
    Local = "Local",
}
export class BookFileManager {
    constructor(public readonly type: BookFileManagerType, public readonly lister: BookFileLister, public readonly uploader: BookFileUploader) {

    }
}