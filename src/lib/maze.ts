import type { StepOption } from "@/controllers/maze/getMazeSolution"

export const gridSizeRegex = /([0-9]+)x([0-9]+)/ // 123x456
export const positionRegex = /(^[A-Z])(\d{1,2})/ // [A1 ... Z99]

interface FindRouteParams {
  gridSize: string
  walls: string[]
  entrance: string
  stepsOption: StepOption
}

type Coord = [number, number]
type Grid = number[][]

export function findRoute(params: FindRouteParams) {
  const { gridSize, walls, entrance, stepsOption } = params
  const grid = makeGrid(gridSize, walls)
  const route: string[] = findPath(grid, entrance, stepsOption).map(
    coordToPosition
  )
  return route
}

function makeGrid(gridSize: string, walls: string[]) {
  const { columns, rows } = getGridDimensions(gridSize)

  const mazeGrid: number[][] = new Array(columns)
    .fill(0)
    .map(() => new Array(rows).fill(0))

  walls.forEach((wall) => {
    const { column, row } = getGridPosition(wall)
    mazeGrid[column][row] = 1
  })

  return mazeGrid
}

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

function printGrid(grid: Grid) {
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

function isInGrid(coordinates: Coord, grid: Grid) {
  if (coordinates[0] < 0 || coordinates[1] < 0) return false
  if (coordinates[0] >= grid.length || coordinates[1] >= grid[0].length)
    return false
  return true
}

export function isInGridRange(gridSize: string, position: string) {
  const { columns, rows } = getGridDimensions(gridSize)
  const { column, row } = getGridPosition(position)
  console.log(columns, rows, column, row)
  if (column > columns) return false
  if (row > rows) return false

  return true
}

// To do
export function isAtEdge(gridSize: string, position: string) {
  return true
}

function isWall(coordinates: Coord, grid: Grid) {
  return grid[coordinates[0]][coordinates[1]] === 1
}

function isVisited(coordinates: Coord, steps: Coord[]) {
  return steps.some((step) => hasSameCoordinates(step, coordinates))
}

function hasSameCoordinates(coord1: Coord, coord2: Coord) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1]
}

function findPath(mazeGrid: Grid, entrance: string, stepsOptions: StepOption) {
  let currentPosition = getGridPosition(entrance)
  const startCoord: Coord = [currentPosition.column, currentPosition.row]

  const exits: [Coord, Coord] = [
    [0, mazeGrid[0].length - 1],
    [mazeGrid.length - 1, mazeGrid[0].length - 1]
  ]
  let winnerPath: Coord[] = []

  const visit = (steps: Coord[]) => {
    const currentStep = steps[steps.length - 1]

    if (exits.some((exit) => hasSameCoordinates(currentStep, exit))) {
      if (stepsOptions === "min") {
        if (winnerPath.length > steps.length || winnerPath.length === 0) {
          winnerPath = steps
        }
      } else if (stepsOptions === "max") {
        if (winnerPath.length < steps.length) {
          winnerPath = steps
        }
      }
    }

    const [col, row] = currentStep

    const top: Coord = [col, row - 1]
    const left: Coord = [col + 1, row]
    const bottom: Coord = [col, row + 1]
    const right: Coord = [col - 1, row]

    ;[top, left, bottom, right].forEach((pos) => {
      if (
        isInGrid(pos, mazeGrid) &&
        !isWall(pos, mazeGrid) &&
        !isVisited(pos, steps)
      ) {
        visit([...steps, pos])
      }
    })
  }
  visit([startCoord])

  return winnerPath
}

function coordToPosition(coord: Coord) {
  const columnAsLetter = String.fromCharCode(coord[0] + "A".charCodeAt(0))
  const row = coord[1] + 1
  return `${columnAsLetter}${row}`
}
