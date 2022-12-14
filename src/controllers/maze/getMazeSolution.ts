import express, { Response, Request } from "express"

import { dbClient } from "@/services/prisma"
import { currentUser } from "@/middlewares/current-user"
import { requireAuth } from "@/middlewares/require-auth"
import { validateRequest } from "@/middlewares/validate-request"
import { BadRequestError } from "@/errors/bad-request-error"
import { NotFoundError } from "@/errors/not-found-error"
import { NotAuthorizedError } from "@/errors/not-authorized-error"
import { findRoutes } from "@/lib/maze"
import { query } from "express-validator"

const router = express.Router()

export type StepOption = "min" | "max"
const stepsOptions: StepOption[] = ["min", "max"]

router.get(
  "/maze/:id/solution",
  currentUser,
  requireAuth,
  [
    query("steps")
      .isString()
      .custom((steps) => stepsOptions.includes(steps))
      .withMessage(
        `Steps query parameter must be provided with one of the following values: ${stepsOptions.join(
          ", "
        )}`
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const mazeId = Number(req.params.id)
    if (Number.isNaN(mazeId)) throw new BadRequestError("Invalid maze id")

    const steps = req.query.steps

    const maze = await dbClient.maze.findUnique({
      select: {
        entrance: true,
        gridSize: true,
        walls: true,
        ownerId: true
      },
      where: { id: mazeId }
    })

    if (!maze) throw new NotFoundError()

    if (maze.ownerId !== req.currentUser!.id) throw new NotAuthorizedError()

    const { routeToBottomLeft, routeToBottomRight } = findRoutes({
      gridSize: maze.gridSize,
      walls: maze.walls.split(","),
      stepsOption: steps as StepOption,
      entrance: maze.entrance
    })

    if (!routeToBottomLeft.length && !routeToBottomRight.length) {
      throw new BadRequestError("This maze has no solution!")
    }
    if (routeToBottomLeft.length && routeToBottomRight.length) {
      throw new BadRequestError(
        "This maze has two exits! This is not permitted."
      )
    }
    const route = routeToBottomLeft.length
      ? routeToBottomLeft
      : routeToBottomRight

    res.status(200).send({ path: route })
  }
)

export { router as getMazeSolutionRouter }
