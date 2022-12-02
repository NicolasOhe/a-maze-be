import express, { RequestHandler } from "express"
import "express-async-errors"
import dotenv from "dotenv"
import cors from "cors"
import cookieSession from "cookie-session"

import { signupRouter } from "@/controllers/signup"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json() as RequestHandler)
app.use(cookieSession)

// Routes
app.use(signupRouter)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
