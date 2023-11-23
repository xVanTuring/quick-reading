import Elysia, { NotFoundError } from "elysia";

export function setupUserId(app: Elysia<string>) {
    return app.derive(() => {
        let userId: string | null = "admin"
        if (userId == null) {
            throw new NotFoundError("user Not found error")
        }
        return {
            userId: userId
        }
    })
}
export type SetupUserId = ReturnType<typeof setupUserId>