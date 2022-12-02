import express, { Response, Request } from "express"
import { pick } from "lodash"
import { body } from "express-validator"

import { prisma } from "@/services/prisma"
import { Maze } from "@prisma/client"
import { currentUser } from "@/middlewares/current-user"
import { requireAuth } from "@/middlewares/require-auth"
import { validateRequest } from "@/middlewares/validate-request"

const router = express.Router()

const gridSizeRegex = /([0-9]+)x([0-9]+)/ // 123x456
const positionRegex = /(^[A-Z])(\d{1,2})/ // [A1 ... Z99]

function isValidPosition(position: string) {
  if (typeof position !== "string") return false
  return Boolean(position.match(positionRegex))
}

function isValidGridSize(gridSize: string) {
  const matchGrid = gridSize.match(gridSizeRegex)

  if (!matchGrid) return false

  const columns = Number(matchGrid[1])
  const rows = Number(matchGrid[2])

  if (columns > 26 || columns === 0) return false
  if (rows > 99 || rows === 0) return false
  return true
}

function isInGridRange(gridSize: string, position: string) {
  const matchGrid = gridSize.match(gridSizeRegex)
  if (!matchGrid) return false

  const matchPosition = position.match(positionRegex)
  if (!matchPosition) return false

  const gridColumns = Number(matchGrid[1])
  const gridRows = Number(matchGrid[2])

  const column = matchPosition[1].charCodeAt(0) - "A".charCodeAt(0)
  const row = Number(matchPosition[2])

  if (column > gridColumns) return false
  if (row > gridRows || row === 0) return false

  return true
}

// To do
function isAtEdge(gridSize: string, position: string) {
  return true
}

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
        for (let wall of walls) {
          if (!isValidPosition(wall) || !isInGridRange(req.body.gridSize, wall))
            return false
        }
        return true
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
    const newMaze = await prisma.maze.create({
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

router.get(
  "/maze",
  currentUser,
  requireAuth,

  async (req: Request, res: Response) => {
    const mazesInDB = await prisma.maze.findMany({
      select: {
        entrance: true,
        gridSize: true,
        walls: true
      },
      where: { ownerId: req.currentUser!.id }
    })

    interface ExternalMaze {
      entrance: string
      gridSize: string
      walls: string[]
    }

    let mazes: ExternalMaze[] = []

    if (mazesInDB) {
      mazes = mazesInDB.map((maze) => {
        return { ...maze, walls: maze.walls.split(",") }
      })
    }

    res.status(201).send(mazes)
  }
)

export { router as newMazeRouter }
