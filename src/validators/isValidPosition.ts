import { positionRegex } from "@/lib/maze"

export function isValidPosition(position: string) {
  if (typeof position !== "string") return false
  return Boolean(position.match(positionRegex))
}
