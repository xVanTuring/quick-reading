import { buildApp } from "./app";
import { loadFromDisk } from "./books";

await loadFromDisk()
const app = buildApp()
app.listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
