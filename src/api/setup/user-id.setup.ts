import bearer from "@elysiajs/bearer";
import type { jwt } from "@elysiajs/jwt";
import { NotFoundError } from "elysia";
import { MergeElysiaDecorator } from "../../util/type/elysia-merge";

class UnauthorizedError extends Error {
}
type JwtElysia = ReturnType<typeof jwt<"jwt">>
type BearerElysia = ReturnType<typeof bearer>
export function setupUserId(app: MergeElysiaDecorator<JwtElysia, BearerElysia>) {
    return app.derive(async ({ jwt, bearer, set }) => {
        if (process.env["MOCK_USERID"]) {
            return {
                userId: process.env["MOCK_USERID"]
            }
        }
        if (!bearer) {
            set.status = 400
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`
            throw new UnauthorizedError()
        }
        const profile = await jwt.verify(bearer)
        if (!profile) {
            set.status = 400
            throw new UnauthorizedError()
        }
        let userId: string | null = profile.sub ?? null
        if (userId == null) {
            throw new NotFoundError("user Not found error")
        }
        return {
            userId: userId
        }
    })
}
export type SetupUserId = ReturnType<typeof setupUserId>