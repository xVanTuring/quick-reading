import { Elysia, NotFoundError, t } from "elysia";
import { books, saveToDisk } from "./books";

export const api = new Elysia({ prefix: '/api' });
api.get('/books', () => {
  return books;
});

api.post('/books/:id/progress', ({ params: { id }, body, set }) => {
  // todo check page argument
  const book = books.find((book) => book.id === id);
  if (!book) {
    throw new NotFoundError('Book not found');
  }
  book.readingPage = body.page;
  saveToDisk();
  return {};
}, {
  body: t.Object({
    page: t.Number()
  })
});
api.get('/books/:id', ({ params: { id } }) => {
  const book = books.find((book) => book.id === id);
  if (!book) {
    throw new NotFoundError('Book not found');
  }
  return book;
});