import fs from 'fs/promises'
export interface BookData {
  title: string,
  readingPage: number,
  file: {
    localPath: string,
    publicUrl: string
  },
  id: string
}
const BookSavePath = "./books.json";
export async function loadFromDisk() {
  if (!await fs.exists(BookSavePath)) {
    return
  }
  const bookData = JSON.parse(await fs.readFile(BookSavePath, "utf-8")) as BookData[];
  books.splice(0, books.length, ...bookData);
}
export async function saveToDisk() {
  fs.writeFile(BookSavePath, JSON.stringify(books));
}
export const books: BookData[] = [
  {
    title: "代码整洁之道.pdf",
    readingPage: 0,
    file: {
      localPath: "./books/sdzx21c2z4c.pdf",
      publicUrl: "/public/books/sdzx21c2z4c.pdf"
    },
    id: "sdzx21c2z4c"
  },
  {
    title: "编程珠玑.pdf",
    readingPage: 0,
    file: {
      localPath: "./books/sdaww454s4c.pdf",
      publicUrl: "/public/books/sdaww454s4c.pdf"

    },
    id: "sdaww454s4c"
  },
];
