const gridSizeRegex = /([0-9]+)x([0-9]+)/ // 123x456
const positionRegex = /(^[A-Z])(\d{1,2})/ // [A1 ... Z99]

const entrance = "A1"
const gridSize = "8x12"
const walls = [
  // "C1",
  "G1",
  "A2",
  "C2",
  "E2",
  "G2",
  "C3",
  "E3",
  "B4",
  "C4",
  "E4",
  "F4",
  "G4",
  "B5",
  "E5",
  "B6",
  "D6",
  "E6",
  "G6",
  "H6",
  "B7",
  "D7",
  "G7"
  //   "B8"
]
const minResult = ["A1", "B1", "B2", "B3", "A3", "A4", "A5", "A6", "A7", "A8"]

const end: Coord = [0, getGridDimensions(gridSize).rows - 1]

function getGridDimensions(gridSize: string) {
  const matchGrid = gridSize.match(gridSizeRegex)
  if (!matchGrid) throw new Error()

  const columns = Number(matchGrid[1])
  const rows = Number(matchGrid[2])

  return { columns, rows }
}

function getGridPosition(position: string) {
  const matchPosition = position.match(positionRegex)
  if (!matchPosition) return { column: -1, row: -1 }

  const column = matchPosition[1].charCodeAt(0) - "A".charCodeAt(0)
  const row = Number(matchPosition[2]) - 1

  return { column, row }
}

const { columns, rows } = getGridDimensions(gridSize)
const mazeGrid: number[][] = new Array(columns)
  .fill(0)
  .map(() => new Array(rows).fill(0))

walls.forEach((wall) => {
  const { column, row } = getGridPosition(wall)
  mazeGrid[column][row] = 1
})

function printGrid(grid: number[][]) {
  const cols = grid.length
  const rows = grid[0].length
  let string = ""

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      string += grid[c][r] === 0 ? ". " : "X "
    }
    string += `\n`
  }
  return string
}

console.log(printGrid(mazeGrid))

type Coord = [number, number]
function isInGrid(coordinates: Coord, mazeGrid: number[][]) {
  if (coordinates[0] < 0 || coordinates[1] < 0) return false
  if (coordinates[0] >= mazeGrid.length || coordinates[1] >= mazeGrid[0].length)
    return false
  return true
}
function isWall(coordinates: Coord, mazeGrid: number[][]) {
  return mazeGrid[coordinates[0]][coordinates[1]] === 1
}
function isVisited(coordinates: Coord, steps: Coord[]) {
  return steps.some((step) => hasSameCoordinates(step, coordinates))
}

function hasSameCoordinates(coord1: Coord, coord2: Coord) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1]
}

function findPossiblePaths(mazeGrid: number[][], entrance: string) {
  let isDone = false
  let currentPosition = getGridPosition(entrance)
  const startCoord: Coord = [currentPosition.column, currentPosition.row]
  const paths = [{ done: false, valid: false, steps: [startCoord] }]

  while (!isDone) {
    for (let path of paths) {
      if (path.done) continue

      const currentStep = path.steps[path.steps.length - 1]

      if (hasSameCoordinates(currentStep, end)) {
        path.done = true
        continue
      }
      const [col, row] = currentStep

      const top: Coord = [col, row - 1]
      const left: Coord = [col + 1, row]
      const bottom: Coord = [col, row + 1]
      const right: Coord = [col - 1, row]

      const matches: Coord[] = []

      ;[top, left, bottom, right].forEach((pos) => {
        if (
          isInGrid(pos, mazeGrid) &&
          !isWall(pos, mazeGrid) &&
          !isVisited(pos, path.steps)
        ) {
          matches.push(pos)
        }
      })

      if (matches.length === 0) {
        path.done = true
        continue
      }

      if (matches.length === 1) {
        path.steps.push(matches.pop()!)
        continue
      }

      if (matches.length > 1) {
        const commonSteps = [...path.steps]
        path.steps.push(matches.pop()!)
        matches.forEach((pos) => {
          paths.push({
            done: false,
            valid: false,
            steps: [...commonSteps, pos]
          })
        })
      }
    }
    if (paths.every((path) => path.done)) isDone = true
  }

  return paths.map((path) => path.steps)
}

const start = performance.now()
const paths: Coord[][] = findPossiblePaths(mazeGrid, entrance)
console.log("possible paths", paths.length)

const winningPaths = paths
  .filter((path) => path.some((step) => hasSameCoordinates(step, end)))
  .map((path) => path.map(coordToPosition))
console.log("winningPaths", winningPaths.length)
console.log("winningPaths", winningPaths)
const elapsed = performance.now() - start
console.log("time elapsed", elapsed)

function coordToPosition(coord: Coord) {
  const columnAsLetter = String.fromCharCode(coord[0] + "A".charCodeAt(0))
  const row = coord[1] + 1
  return `${columnAsLetter}${row}`
}
