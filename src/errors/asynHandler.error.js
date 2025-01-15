// method for handling async error handling.
export const asyncErrorHandler = (method) => (req , res , next) => {
    Promise.resolve(method(req , res , next)).catch(err => {
        next(err);
    });
}