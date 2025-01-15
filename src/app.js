import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { authRouter } from './routes/auth/auth.routes.js';

export const app = express();

app.use(cors({
    origin : ['http://localhost:5173' , 'http://localhost:5174' , 'http://localhost:3000'],
    methods : ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'],
    credentials : true
}))

app.use(cookieParser())

app.use(express.urlencoded({
    extended : true
}))

app.use(express.json({
    limit : '20kb'
}))

//now we handle routes related from authentication.
app.use('/api/v1/auth' , authRouter)


app.use((err , req , res , next) => {
    err.message = err.message || "Internal Server Error",
    err.status = err.status || 500

    res.status(err.status).json({
        success : false,
        message : err.message
    })
})