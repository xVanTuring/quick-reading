document.querySelector("#upload-btn")!.addEventListener("click", uploadFile);

const msgSpan: HTMLSpanElement = document.querySelector("#msg-span");

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
                body: formData,
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
            })
            if (response.ok) {
                const book = await response.json();
                const fileName = encodeURIComponent(book.id)
                await saveFile(fileName, file)
                alert("File uploaded successfully")
            } else {
                console.error("Error uploading file:", await response.text());
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }
}
async function loadList() {
    const bookList = document.getElementById("book-list");
    try {
        const books = await fetch("/api/books", { headers: { "Authorization": "Bearer " + localStorage.getItem("token") }, })
            .then(response => response.json())
        for (const book of books) {
            const li = document.createElement("li");
            const fileName = encodeURIComponent(book.id)
            if (!(await checkFileValidate(fileName, book.file.size))) {
                const button = document.createElement("button");
                button.innerText = `Download ${book.title}`;
                button.onclick = () => {
                    downloadFile(book.file.publicUrl, fileName, book.file.size, book.title)
                }
                li.appendChild(button);
            } else {
                const a = document.createElement("a");
                a.href = `./pdfjs/web/viewer.html?book=${book.id}`;
                a.innerHTML = book.title;
                li.appendChild(a);
            }
            bookList.appendChild(li);
        }
    } catch (error) {

    }


}

async function checkFileValidate(fileName: string, fileSize: number) {
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
async function saveFile(fileName: string, file: File) {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(file)
    await writable.close()
}

async function downloadFile(url: string, fileName: string, totalSize: number, bookTitle: string) {
    async function writeFile(url: string, writable: FileSystemWritableFileStream) {
        const response = await fetch(url, { headers: { "Authorization": "Bearer " + localStorage.getItem("token") }, });
        const reader = response.body.getReader();
        let totalLength = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log({ done, value })
                await writable.close()
                return;
            }
            totalLength += value.buffer.byteLength;
            const percent = Math.floor(totalLength / totalSize * 100);
            msgSpan.innerText = `Downloading: ${bookTitle} - ${percent}%`
            await writable.write(value.buffer)
        }
    }

    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(fileName, { create: true })
    let writable = await fileHandle.createWritable()
    await writeFile(url, writable)
}

; (function main() {
    if (!localStorage.getItem("token")) {
        window.location.replace("/login.html")
    } else {
        loadList();
    }
})();