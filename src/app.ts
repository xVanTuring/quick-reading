import { Elysia } from "elysia";
import { buildApi } from "./api";
import { swagger } from '@elysiajs/swagger'

export async function buildApp() {
    const app = new Elysia();
    const api = await buildApi();
    return app.use(swagger({
        documentation: {
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                    }
                }
            },
            security: [
                {
                    BearerAuth: []
                }
            ],
            info: {
                title: "QuickReading",
                version: "1.0.0",
            }
        },
        swaggerOptions: {
            persistAuthorization: true,
        }
    })).use(api);
}

