import { Elysia } from "elysia";
import { buildApi } from "./api";

export async function buildApp() {
    const app = new Elysia();
    const api = await buildApi();
    return app.use(api);
}

