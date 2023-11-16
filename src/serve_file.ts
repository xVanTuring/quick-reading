import { staticPlugin } from '@elysiajs/static'
import Elysia from 'elysia';

export function serveFile(app: Elysia, pathDir: string) {
    app.use(staticPlugin({
        assets: pathDir,
        // prefix: "/book-file",
    }))
} 