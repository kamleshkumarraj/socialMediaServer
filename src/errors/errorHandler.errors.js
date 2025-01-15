export class ErrorHandler extends Error {
    constructor(message , status) {
        super(message);
        this.status = status || 500

        // Maintaining stack trace for easier debugging
        Error.captureStackTrace(this , this.constructor);
    }

}