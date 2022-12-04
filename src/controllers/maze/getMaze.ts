import express, { Response, Request } from "express"

import { dbClient } from "@/services/prisma"
import { currentUser } from "@/middlewares/current-user"
import { requireAuth } from "@/middlewares/require-auth"

const router = express.Router()

router.get(
  "/maze",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const mazesInDB = await dbClient.maze.findMany({
      select: {
        entrance: true,
        gridSize: true,
        walls: true,
        id: true
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

export { router as getMazeRouter }
