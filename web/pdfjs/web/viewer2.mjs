let bookId = new URLSearchParams(window.location.search).get("book");
const viewerLoadPromise = new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', async () => {
        resolve(PDFViewerApplication.initializedPromise)
    })
});

function updateReadingProgress(bookId, progress) {
    fetch(`/api/books/${bookId}/progress`,
        {
            body: JSON.stringify({ page: progress }),
            headers: { "content-type": "application/json" },
            method: "POST"
        }).then((response) => response.json())
        .catch((error) => {
            console.error(error)
        })
}
if (bookId == null) {
    alert("No book id provided. Going back to Main Page");
    window.location.href = "/";
} else {
    fetch(`/api/books/${bookId}`).then(response => response.json())
        .then((book) => {
            updateDocumentTitle(book)
            setReaderToBook(book)
            console.log(`Reading to ${book.readingPage}`)
            console.log(book)
        })
}
// http://localhost:8080/web/pdfjs/web/viewer.html?book=sdzx21c2z4c
async function setReaderToBook(book) {
    await viewerLoadPromise;
    await PDFViewerApplication.open({
        url: book.file.publicUrl
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

