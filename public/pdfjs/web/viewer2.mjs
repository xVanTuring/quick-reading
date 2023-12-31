const viewerLoadPromise = new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', async () => {
        resolve(PDFViewerApplication.initializedPromise)
    })
});

function updateReadingProgress(bookId, progress) {
    fetch(`/api/books/${bookId}/progress`,
        {
            body: JSON.stringify({ page: progress }),
            headers: { "content-type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") },
            method: "POST"
        }).then((response) => response.json())
        .catch((error) => {
            console.error(error)
        })
}

// http://localhost:8080/web/pdfjs/web/viewer.html?book=sdzx21c2z4c
async function setReaderToBook(book, bookData) {
    await viewerLoadPromise;
    await PDFViewerApplication.open({
        data: bookData
    })
    PDFViewerApplication.eventBus.on("documentloaded", (e) => {
        PDFViewerApplication.page = book.readingPage + 1
        setTimeout(() => {
            PDFViewerApplication.eventBus.on("pagechanging", (e) => {
                updateReadingProgress(book.id, e.pageNumber - 1)
            });
        }, 100);

    });
}
function updateDocumentTitle(book) {
    document.title = book.title;
}
async function loadFromParams() {
    let bookId = new URLSearchParams(window.location.search).get("book");
    if (bookId == null) {
        alert("No book id provided. Going back to Main Page");
        window.location.href = "/";
    } else {
        const response = await fetch(`/api/books/${bookId}`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
        })
        const book = await response.json()

        updateDocumentTitle(book)
        console.log(`Reading to ${book.readingPage}`)
        const fileName = encodeURIComponent(book.id);
        if (!(await checkFileValidate(fileName, book.file.size))) {
            alert("Go back!")
            return
        }
        /** @type {File} */
        const bookFile = await getFileBlob(fileName)

        setReaderToBook(book, await bookFile.arrayBuffer())
    }
}

async function checkFileValidate(fileName, fileSize) {
    try {
        const opfsRoot = await navigator.storage.getDirectory();
        const fileHandle = await opfsRoot.getFileHandle(fileName)
        if (fileHandle == null) {
            return false
        }
        const file = await fileHandle.getFile()
        console.debug(`${fileName} File size: ${file.size} vs ${fileSize}`)
        return file.size === fileSize;
    }
    catch (err) {
        return false
    }
}
async function getFileBlob(fileName) {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(fileName)

    return fileHandle.getFile()
}

loadFromParams()
