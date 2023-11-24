import { NotFoundError, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { MergeElysiaDecorator } from "../../util/type/elysia-merge";
import { SetupUserInfo } from "../setup/user.setup";
import { DuplicatedError } from "../../util/error/DuplicatedError";
type JwtElysia = ReturnType<typeof jwt<"jwt">>
export function authApi(app: MergeElysiaDecorator<JwtElysia, SetupUserInfo>) {
    app.post('/signup', async ({ userInfoStorage, body, jwt }) => {
        try {
            const { id: userId } = await userInfoStorage.createUserInfo(
                {
                    username: body.username,
                    password: await Bun.password.hash(body.password)
                }
            )
            return {
                token: await jwt.sign({
                    sub: userId
                })
            }

        } catch (error) {
            console.error(error)
            throw new DuplicatedError("User name is existed")
        }
    }, {
        body: t.Object({
            username: t.String({
                minLength: 4,
                maxLength: 20,
                pattern: "^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$"
            }),
            password: t.String({
                minLength: 5,
                maxLength: 15
            })
        }),
        response: t.Object({
            token: t.String()
        }),
        detail: {
            tags: ['Auth']
        }
    })
    app.post('/login', async ({ jwt, body, userInfoStorage }) => {
        const userInfo = await userInfoStorage.getUserInfoByName(body.username)
        if (userInfo == null) {
            throw new NotFoundError("User not found")
        }
        const matched = await Bun.password.verify(body.password, userInfo.password)
        if (!matched) {
            throw new NotFoundError("User not found")
        }
        return {
            token: await jwt.sign({
                sub: userInfo.id
            })
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        }),
        response: t.Object({
            token: t.String()
        }),
        detail: {
            tags: ['Auth']
        }
    })
    return app
}