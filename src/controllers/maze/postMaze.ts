import express, { Response, Request } from "express"
import { pick } from "lodash"
import { body } from "express-validator"

import { dbClient } from "@/services/prisma"
import { currentUser } from "@/middlewares/current-user"
import { requireAuth } from "@/middlewares/require-auth"
import { validateRequest } from "@/middlewares/validate-request"
import { isAtEdge, isInGridRange } from "@/lib/maze"
import { isValidGridSize } from "@/validators/isValitGridSize"
import { isValidPosition } from "@/validators/isValidPosition"

const router = express.Router()

router.post(
  "/maze",
  currentUser,
  requireAuth,
  [
    body("gridSize")
      .isString()
      .custom((gridSize) => isValidGridSize(gridSize))
      .withMessage("Invalid gridSize."),
    body("walls")
      .isArray()
      .custom((walls, { req }) => {
        return (walls as string[]).every(
          (wall) =>
            isValidPosition(wall) && isInGridRange(req.body.gridSize, wall)
        )
      })
      .withMessage("Invalid walls format"),
    body("entrance")
      .isString()
      .custom(
        (entrance, { req }) =>
          isValidPosition(entrance) &&
          isInGridRange(req.body.gridSize, entrance) &&
          isAtEdge(req.body.gridSize, entrance)
      )
      .withMessage("Invalid entrance.")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const newMaze = await dbClient.maze.create({
      data: {
        ownerId: req.currentUser!.id,
        gridSize: req.body.gridSize,
        walls: req.body.walls.join(","),
        entrance: req.body.entrance
      }
    })

    res.status(201).send(pick(newMaze, ["id"]))
  }
)

export { router as postMazeRouter }
