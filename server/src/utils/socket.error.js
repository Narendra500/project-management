export class SocketIOError extends Error {
    constructor(code, error) {
        if (!statusCode || !Number.isInteger(statusCode)) throw new Error("ApiError requires an integer statusCode");
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.additionalInfo = additionalInfo;
    }
}
