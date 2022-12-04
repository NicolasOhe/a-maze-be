import { gridSizeRegex } from "@/lib/maze"

const MAX_COLUMNS = 10
const MAX_ROWS = 10

export function isValidGridSize(gridSize: string) {
  const matchGrid = gridSize.match(gridSizeRegex)

  if (!matchGrid) return false

  const columns = Number(matchGrid[1])
  const rows = Number(matchGrid[2])

  if (columns > MAX_COLUMNS || columns === 0) return false
  if (rows > MAX_ROWS || rows === 0) return false
  return true
}
