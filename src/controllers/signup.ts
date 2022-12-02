import express, { Response, Request } from "express"
import { body } from "express-validator"

import { validateRequest } from "@/middlewares/validate-request"

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
    res.status(201).send(req.body)
  }
)

export { router as signupRouter }