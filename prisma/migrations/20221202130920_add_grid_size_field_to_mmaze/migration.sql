-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Maze" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "gridSize" TEXT NOT NULL DEFAULT '',
    "walls" TEXT NOT NULL,
    "entrance" TEXT NOT NULL,
    CONSTRAINT "Maze_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Maze" ("entrance", "id", "ownerId", "walls") SELECT "entrance", "id", "ownerId", "walls" FROM "Maze";
DROP TABLE "Maze";
ALTER TABLE "new_Maze" RENAME TO "Maze";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
