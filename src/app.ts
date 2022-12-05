import express, { RequestHandler } from "express"
import "express-async-errors"
import cors from "cors"
import cookieSession from "cookie-session"

import { signupRouter } from "@/controllers/signup"
import { NotFoundError } from "@/errors/not-found-error"
import { errorHandler } from "@/middlewares/error-handler"
import { loginRouter } from "@/controllers/signin"
import { getMazeRouter } from "@/controllers/maze/getMaze"
import { postMazeRouter } from "@/controllers/maze/postMaze"
import { getMazeSolutionRouter } from "@/controllers/maze/getMazeSolution"

export const app = express()

app.use(cors())
app.use(express.json() as RequestHandler)
app.use(cookieSession({ secure: false, signed: false }))

// Auth routes
app.use(signupRouter)
app.use(loginRouter)

// Maze routes
app.use(getMazeRouter)
app.use(postMazeRouter)
app.use(getMazeSolutionRouter)

// Errors
app.all("*", () => {
  throw new NotFoundError()
})
app.use(errorHandler)
