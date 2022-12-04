import express, { Response, Request } from "express"
import { body } from "express-validator"

import { validateRequest } from "@/middlewares/validate-request"
import { dbClient } from "@/services/prisma"
import { BadRequestError } from "@/errors/bad-request-error"
import { Password } from "@/lib/password"

const router = express.Router()

router.post(
  "/user",
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

    const alreadyExists = Boolean(
      await dbClient.user.findUnique({
        where: { username }
      })
    )

    if (alreadyExists) {
      throw new BadRequestError("User name already in use.")
    }

    const hashedPassword = await Password.toHash(password)

    const user = await dbClient.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })
    res.status(201).send()
  }
)

export { router as signupRouter }
