import dotenv from 'dotenv';
dotenv.config({
    path : 'src/.env'
})

import {app} from './app.js'
import { connectDB } from './db/connection.js';
import { sendResponse } from './utils/sendResponse.js';

app.get('/' , (req , res) => {
    sendResponse({res , status : 200 , data : 'Every thing is ok !' , message : 'Welcome in server api with express'})
})

connectDB()
.then(() => {
    app.listen(process.env.PORT , () => {
        console.log(`Server is running on port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log(`We can't start server due to database connection error : ${err.message}`)
})
