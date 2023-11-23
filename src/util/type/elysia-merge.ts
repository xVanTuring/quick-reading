import type { DecoratorBase, Elysia } from "elysia";

export type MergeDecorator<A extends DecoratorBase, B extends DecoratorBase> = {
    "request": A["request"] & B["request"],
    "store": A["store"] & B["store"],
}
export type MergeElysiaDecorator<A extends Elysia<string>, B extends Elysia<string>> = Elysia<string,
    MergeDecorator<A extends Elysia<infer _, infer X> ? X : never, B extends Elysia<infer _, infer Y> ? Y : never>>