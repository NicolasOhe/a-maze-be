import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface UserPayload {
  id: number
  username: string
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.accessToken) {
    return next()
  }

  try {
    const payload = jwt.verify(
      req.session.accessToken,
      process.env.JWT_SECRET!
    ) as UserPayload
    req.currentUser = payload
  } catch {}

  next()
}
