import type { StepOption } from "@/controllers/maze/getMazeSolution"
import { BadRequestError } from "@/errors/bad-request-error"
import _ from "lodash"

export const gridSizeRegex = /([0-9]+)x([0-9]+)/ // 123x456
export const positionRegex = /(^[A-Z])(\d{1,2})/ // [A1 ... Z99]

const MAXIMUM_ITERATIONS = 1000000

interface FindRouteParams {
  gridSize: string
  walls: string[]
  entrance: string
  stepsOption: StepOption
}

type Coord = [number, number]
type Grid = number[][]

export function findRoutes(params: FindRouteParams) {
  const { gridSize, walls, entrance, stepsOption } = params

  const { columns, rows } = getGridDimensions(gridSize)
  const grid = makeGrid(columns, rows, walls)

  const bottomLeft: Coord = [0, rows - 1]
  const bottomRight: Coord = [columns - 1, rows - 1]
  const exits: [Coord, Coord] = [bottomLeft, bottomRight]
  const entrancePosition = getGridPosition(entrance)
  const entranceCoord: Coord = [entrancePosition.column, entrancePosition.row]

  const routeToBottomLeft: string[] = findPath(
    grid,
    entranceCoord,
    exits[0],
    stepsOption
  ).map(coordToPosition)

  const routeToBottomRight: string[] = findPath(
    grid,
    entranceCoord,
    exits[1],
    stepsOption
  ).map(coordToPosition)

  let gridPath = _.cloneDeep(grid)
  addPathToGrid(gridPath, routeToBottomLeft)
  console.log("routeToBottomLeft:")
  console.log(printGrid(gridPath))

  gridPath = _.cloneDeep(grid)
  addPathToGrid(gridPath, routeToBottomRight)
  console.log("routeToBottomRight:")
  console.log(printGrid(gridPath))
  return { routeToBottomLeft, routeToBottomRight }
}

function makeGrid(columns: number, rows: number, walls: string[]) {
  const grid: Grid = new Array(columns)
    .fill(0)
    .map(() => new Array(rows).fill(0))

  walls.forEach((wall) => {
    const { column, row } = getGridPosition(wall)
    grid[column][row] = 1
  })

  return grid
}

function addPathToGrid(grid: Grid, path: string[]) {
  path.forEach((p) => {
    const { column, row } = getGridPosition(p)
    grid[column][row] = 2
  })

  return grid
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
      let cell = ". "
      if (grid[c][r] === 1) cell = "X "
      if (grid[c][r] === 2) cell = "@ "
      string += cell
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

function findPath(
  mazeGrid: Grid,
  entrance: Coord,
  exit: Coord,
  stepsOptions: StepOption
) {
  let winnerPath: Coord[] = []
  let counter = 0

  const visit = (steps: Coord[]) => {
    counter++
    if (counter > MAXIMUM_ITERATIONS)
      throw new BadRequestError("Maze complexity exceeds computation capacity.")

    const currentStep = steps[steps.length - 1]

    if (hasSameCoordinates(currentStep, exit)) {
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
  visit([entrance])

  return winnerPath
}

function coordToPosition(coord: Coord) {
  const columnAsLetter = String.fromCharCode(coord[0] + "A".charCodeAt(0))
  const row = coord[1] + 1
  return `${columnAsLetter}${row}`
}
