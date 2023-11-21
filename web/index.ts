document.querySelector("#upload-btn")!.addEventListener("click", uploadFile);


const fileInput: HTMLInputElement = document.querySelector("#file-input");

const titleInput: HTMLInputElement = document.querySelector("#title-input");
fileInput.addEventListener("change", fileSelectChanged);

function fileSelectChanged(ev: Event) {
    if (fileInput.files.length != 1) {
        return
    }
    const file = fileInput.files[0]
    titleInput.value = file.name.replace(".pdf", "")
}
async function uploadFile() {
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", titleInput.value)

        try {
            const response = await fetch("/api/books", {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                const book = await response.json();
                const fileName = encodeURIComponent(book.id)
                const opfsRoot = await navigator.storage.getDirectory();
                const fileHandle = await opfsRoot.getFileHandle(fileName, { create: true })
                const writable = await fileHandle.createWritable()
                await writable.write(file)
                await writable.close()
                alert("File uploaded successfully")
            } else {
                console.error("Error uploading file:", await response.text());
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }
}
fetch("/api/books")
    .then(response => response.json())
    .then(books => {
        const bookList = document.getElementById("book-list");
        books.forEach(book => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `./pdfjs/web/viewer.html?book=${book.id}`;
            a.innerHTML = book.title;
            li.appendChild(a);
            bookList.appendChild(li);
        });
    });