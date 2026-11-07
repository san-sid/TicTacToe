export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = readonly Cell[]
export type Line = readonly [number, number, number]

export interface WinResult {
  winner: Player
  line: Line
}

/** The eight ways to win: three rows, three columns, two diagonals. */
export const LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const emptyBoard = (): Board => Array<Cell>(9).fill(null)

export const opponent = (player: Player): Player => (player === 'X' ? 'O' : 'X')

export function findWin(board: Board): WinResult | null {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = board[a]
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return { winner: mark, line }
    }
  }
  return null
}

export const isFull = (board: Board): boolean => board.every((cell) => cell !== null)

export function emptyCells(board: Board): number[] {
  const open: number[] = []
  board.forEach((cell, index) => {
    if (cell === null) open.push(index)
  })
  return open
}

/**
 * Returns a new board with the move applied. An out-of-range or occupied
 * square returns the original board untouched (same reference).
 */
export function place(board: Board, index: number, player: Player): Board {
  if (!Number.isInteger(index) || index < 0 || index > 8 || board[index] !== null) {
    return board
  }
  const next = board.slice()
  next[index] = player
  return next
}
