import express, { RequestHandler } from "express"
import "express-async-errors"
import dotenv from "dotenv"
import cors from "cors"
import cookieSession from "cookie-session"

import { signupRouter } from "@/controllers/signup"
import { NotFoundError } from "@/errors/not-found-error"
import { errorHandler } from "@/middlewares/error-handler"
import { loginRouter } from "@/controllers/signin"
import { newMazeRouter } from "./controllers/maze"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json() as RequestHandler)
app.use(cookieSession({ secure: false, signed: false }))

// Routes
app.use(signupRouter)
app.use(loginRouter)
app.use(newMazeRouter)

// Errors
app.all("*", () => {
  throw new NotFoundError()
})
app.use(errorHandler)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
