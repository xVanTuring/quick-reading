export class UnauthorizedError extends Error {
    code: string = "400";
    status: number = 400;
    constructor(msg: string = "Unauthorized") {
        super(msg);
        this.name = "UnauthorizedError";
    }
}