import { buildApp } from "./app";

const app = buildApp()
await app.modules
app.listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
