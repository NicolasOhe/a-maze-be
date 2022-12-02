import express, { Response, Request } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"

import { validateRequest } from "@/middlewares/validate-request"
import { prisma } from "@/services/prisma"
import { BadRequestError } from "@/errors/bad-request-error"
import { Password } from "@/lib/password"

const router = express.Router()

router.post(
  "/login",
  [
    body("username")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("User name must be between 4 and 20 characters."),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters.")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw new BadRequestError("Invalid credentials.")
    }

    const isPasswordRight = await Password.compare(user.password, password)

    if (!isPasswordRight) {
      throw new BadRequestError("Invalid credentials.")
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" }
    )
    req.session = { accessToken }

    res.status(201).send()
  }
)

export { router as loginRouter }
