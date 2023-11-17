import { Elysia } from "elysia";
import { api } from "./api";

export function buildApp() {
    const app = new Elysia();
    app.use(api);
    return app;
}

