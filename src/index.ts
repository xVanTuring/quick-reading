import { buildApp } from "./app";

try {
  const app = await buildApp()
  app.listen(3000)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
} catch (error) {
  console.error(
    `Elysia failed to start`, error
  );
}
