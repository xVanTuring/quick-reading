import { Elysia } from "elysia";
import staticPlugin from "@elysiajs/static";
import { api } from "./api";

export function buildApp() {
    const app = new Elysia();
    app.use(staticPlugin({
        assets: './public',
        prefix: '/public'
    }));
    app.use(staticPlugin({
        assets: './web',
        prefix: '/web',
    }));
    app.use(api);
    return app;
}

