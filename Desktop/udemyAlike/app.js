import express from "express";
import {config} from "dotenv"
import { courseRouter } from "./routes/courseRoutes.js";
import { userRouter } from "./routes/userRoute.js";
import { connectDB } from "./config/database.js";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";


config({
    path:"./config/config.env"
})

connectDB()

export const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
// routes

app.use('/api/v1',courseRouter)
app.use('/api/v1',userRouter)


// error middleware

app.use(ErrorMiddleware)


