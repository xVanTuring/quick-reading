import Elysia, { NotFoundError, ParseError, t } from "elysia";
import { setup } from "./setup";
export interface BookData {
    title: string,
    readingPage: number,
    totalPage: number,
    file: {
        localPath: string,
        publicUrl: string,
        size: number
    },
    id: string
}
export function buildBooksApi() {
    const books = new Elysia({ prefix: '/books' }).use(setup);
    books.get('/', async ({ store: { storage } }) => {
        const bookInfos = await storage.bookInfoStorage.listBooks();
        const books: BookData[] = []
        for (const book of bookInfos) {
            const fileInfo = await storage.bookFileManager.lister.getFileInfo(book.file.fileName)
            let bookData: BookData = {
                file: {
                    localPath: fileInfo.path.local,
                    publicUrl: await storage.bookFileManager.lister.getPublicPath(book.file.fileName),
                    size: fileInfo.size
                },
                totalPage: book.totalPage,
                id: book.id,
                readingPage: book.progress.page,
                title: book.title
            }
            books.push(bookData)
        }
        return books;
    });

    books.post('/', async ({ pdfium, body, store: { storage } }) => {
        const buffer = await body.file.arrayBuffer()
        try {
            const document = await pdfium.loadDocument(Buffer.from(buffer))
            const fileName = await storage.bookFileManager.uploader.uploadFormArrayBuffer(buffer)
            const bookId = await storage.bookInfoStorage.createBookInfo({
                file: {
                    fileName: fileName,
                    storageType: storage.bookFileManager.type
                },
                progress: {
                    page: 0
                },
                title: body.title,
                totalPage: document.getPageCount()
            });
            return { id: bookId };
        } catch (error) {
            throw new ParseError(`Unable to parse pdf file: ${body.file.name}`)
        }
    }, {
        body: t.Object({
            title: t.String(),
            file: t.File()
        })
    });

    books.post('/:id/progress', async ({ params: { id }, body, store: { storage } }) => {
        await storage.bookInfoStorage.updateBookInfo(id, { progress: { page: body.page } })
        return {};
    }, {
        body: t.Object({
            page: t.Number()
        })
    });
    books.get('/:id', async ({ params: { id }, store: { storage } }) => {
        const bookInfo = await storage.bookInfoStorage.getBookInfo(id)
        if (bookInfo == null) {
            throw new NotFoundError()
        }
        const fileInfo = await storage.bookFileManager.lister.getFileInfo(bookInfo.file.fileName)
        const bookData: BookData = {
            file: {
                localPath: fileInfo.path.local,
                publicUrl: await storage.bookFileManager.lister.getPublicPath(bookInfo.file.fileName),
                size: fileInfo.size
            },
            id: bookInfo.id,
            readingPage: bookInfo.progress.page,
            totalPage: bookInfo.totalPage,
            title: bookInfo.title
        }
        return bookData
    });
    return books
}