export class DuplicatedError extends Error {
    code: string = "400";
    status: number = 400;
    constructor(msg: string = "DuplicatedError") {
        super(msg);
        this.name = "DuplicatedError";
    }
}