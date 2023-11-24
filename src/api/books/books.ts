import { NotFoundError, ParseError, t } from "elysia";
import { SetupBooks } from "../setup/book.setup";
const BookDataDTO = t.Object({
    file: t.Object({
        localPath: t.String(),
        publicUrl: t.String(),
        size: t.Number()
    }),
    totalPage: t.Number(),
    id: t.String(),
    readingPage: t.Number(),
    title: t.String()
});

export type BookData = (typeof BookDataDTO)["static"];

export function booksApi(books: SetupBooks) {
    books.get('/', async ({ bookInfoStorage, bookFileManager }) => {
        const bookInfos = await bookInfoStorage.listBooks();
        const books: BookData[] = []
        for (const book of bookInfos) {
            const fileInfo = await bookFileManager.lister.getFileInfo(book.file.fileName)
            let bookData: BookData = {
                file: {
                    localPath: fileInfo.path.local,
                    publicUrl: await bookFileManager.lister.getPublicPath(book.file.fileName),
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
    }, {
        response: t.Array(BookDataDTO),
        detail: {
            tags: ['Books']
        }
    });
    books.post('/', async ({ pdfium, body, bookInfoStorage, bookFileManager }) => {
        const buffer = await body.file.arrayBuffer()
        try {
            const document = await pdfium.loadDocument(Buffer.from(buffer))
            const fileName = await bookFileManager.uploader.uploadFormArrayBuffer(buffer)
            const bookId = await bookInfoStorage.createBookInfo({
                file: {
                    fileName: fileName,
                    storageType: bookFileManager.type
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
        }),
        response: t.Object({
            id: t.String()
        }),
        detail: {
            tags: ['Books']
        },
    });

    books.post('/:id/progress', async ({ params: { id }, body, bookInfoStorage }) => {
        await bookInfoStorage.updateBookInfo(id, { progress: { page: body.page } })
        return {};
    }, {
        body: t.Object({
            page: t.Number()
        }),
        detail: {
            tags: ['Books']
        },
    });
    books.get('/:id', async ({ params: { id }, bookInfoStorage, bookFileManager }) => {
        const bookInfo = await bookInfoStorage.getBookInfo(id)
        if (bookInfo == null) {
            throw new NotFoundError()
        }
        const fileInfo = await bookFileManager.lister.getFileInfo(bookInfo.file.fileName)
        const bookData: BookData = {
            file: {
                localPath: fileInfo.path.local,
                publicUrl: await bookFileManager.lister.getPublicPath(bookInfo.file.fileName),
                size: fileInfo.size
            },
            id: bookInfo.id,
            readingPage: bookInfo.progress.page,
            totalPage: bookInfo.totalPage,
            title: bookInfo.title
        }
        return bookData
    }, {
        response: BookDataDTO,
        detail: {
            tags: ['Books']
        },
    });
    books.delete('/:id', async ({ params: { id }, bookInfoStorage, bookFileManager }) => {
        const bookInfo = await bookInfoStorage.getBookInfo(id)
        if (bookInfo == null) {
            throw new NotFoundError()
        }
        await bookInfoStorage.deleteBookInfo(id)
        await bookFileManager.uploader.deleteFile(bookInfo.file.fileName)
        return {}
    }, {
        response: t.Object({}),
        detail: {
            tags: ['Books']
        },
    });
    return books;
}