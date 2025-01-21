import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { isLoggedIn } from './middlewares/auth/isLoggedIn.middleware.js';
import { authRouter } from './routes/auth/auth.routes.js';
import { chatsRouter } from './routes/users/chats.routes.js';
import { messageRouter } from './routes/users/message.routes.js';
import { postsRouter } from './routes/users/posts.routes.js';
import { reactionsRouter } from './routes/users/reactions.routes.js';
import { selfRouter } from './routes/users/self.routes.js';
import { userRouter } from './routes/users/users.routes.js';

export const app = express();

app.use(cors({
    origin : ['http://localhost:5173' , 'http://localhost:5174' , 'http://localhost:3000'],
    methods : ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'],
    credentials : true,
    preflightContinue : false
}))

app.options('*' , cors())

app.use(cookieParser())

app.use(express.urlencoded({
    extended : true
}))

app.use(express.json({
    limit : '20kb'
}))

//now we handle routes related from authentication.
app.use('/api/v1/auth' , authRouter)

app.use(isLoggedIn)

// now we handle user related routes.
app.use('/api/v1/user' , userRouter)
app.use('/api/v1/user/post' , postsRouter)
app.use('/api/v1/user/chat' , chatsRouter)
app.use('/api/v1/user/message' , messageRouter)
app.use('/api/v1/user/reaction' , reactionsRouter)
app.use('/api/v1/user/self' , selfRouter)

app.use(async (err , req , res , next) => {
    err.message = err.message || "Internal Server Error",
    err.status = err.status || 500

    res.status(err.status).json({
        success : false,
        message : err.message
    })
})