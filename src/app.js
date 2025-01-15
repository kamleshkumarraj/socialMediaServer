import express from 'express';

export const app = express();

app.use(express.json({
    limit : '20kb'
}))

app.use((err , req , res , next) => {
    err.message = err.message || "Internal Server Error",
    err.status = err.status || 500

    res.status(err.status).json({
        success : false,
        message : err.message
    })
})