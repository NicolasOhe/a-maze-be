import express from "express"
import crypto from "crypto"
import { pick } from "lodash"

import { prisma } from "@/services/prisma"
import { currentUser } from "@/middlewares/current-user"
import { requireAuth } from "@/middlewares/require-auth"

const router = express.Router()

router.post("/maze", currentUser, requireAuth, async (req, res) => {
  const newMaze = await prisma.maze.create({
    data: {
      ownerId: req.currentUser!.id,
      gridSize: req.body.gridSize,
      walls: req.body.walls,
      entrance: req.body.entrance
    }
  })

  res.status(201).send(pick(newMaze, ["id"]))
})

export { router as newMazeRouter }
