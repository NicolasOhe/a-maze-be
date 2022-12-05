import express, { Response, Request } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"

import { validateRequest } from "@/middlewares/validate-request"
import { dbClient } from "@/services/prisma"
import { BadRequestError } from "@/errors/bad-request-error"
import { Password } from "@/lib/password"
import { UserPayload } from "@/middlewares/current-user"

const router = express.Router()

router.post(
  "/login",
  [
    body("username")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Must be between 4 and 20 characters."),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Must be between 4 and 20 characters.")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { username, password } = req.body

    const user = await dbClient.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw new BadRequestError("Invalid credentials.")
    }

    const isPasswordRight = await Password.compare(user.password, password)

    if (!isPasswordRight) {
      throw new BadRequestError("Invalid credentials.")
    }

    const payload: UserPayload = { id: user.id, username: user.username }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "100m"
    })
    req.session = { accessToken }

    res.status(200).send(req.session)
  }
)

export { router as loginRouter }
