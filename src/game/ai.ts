import type { Board, Player } from './board.ts'
import { emptyCells, findWin, isFull, opponent, place } from './board.ts'

export type Difficulty = 'easy' | 'medium' | 'unbeatable'
export type Rng = () => number

const CENTER = 4
const CORNERS = [0, 2, 6, 8]

/**
 * Classic minimax. Scores are from `ai`'s point of view: positive means `ai`
 * wins, negative means it loses. Subtracting `depth` makes the search prefer
 * quicker wins and slower losses.
 */
function minimax(board: Board, turn: Player, ai: Player, depth: number): number {
  const win = findWin(board)
  if (win) return win.winner === ai ? 10 - depth : depth - 10
  if (isFull(board)) return 0

  const scores = emptyCells(board).map((index) =>
    minimax(place(board, index, turn), opponent(turn), ai, depth + 1),
  )
  return turn === ai ? Math.max(...scores) : Math.min(...scores)
}

/** Every move that is equally best for `player` under perfect play. */
export function optimalMoves(board: Board, player: Player): number[] {
  let bestScore = -Infinity
  let best: number[] = []
  for (const index of emptyCells(board)) {
    const score = minimax(place(board, index, player), opponent(player), player, 1)
    if (score > bestScore) {
      bestScore = score
      best = [index]
    } else if (score === bestScore) {
      best.push(index)
    }
  }
  return best
}

/** The square where `player` would win right now, if there is one. */
function winningMove(board: Board, player: Player): number | null {
  for (const index of emptyCells(board)) {
    if (findWin(place(board, index, player))?.winner === player) return index
  }
  return null
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]
}

/**
 * Chooses a square for `ai`.
 *
 * - easy: any open square.
 * - medium: wins if it can, blocks if it must, otherwise prefers the centre.
 *   Beatable with a fork.
 * - unbeatable: minimax. Ties are broken randomly so games vary, but it never
 *   loses.
 */
export function chooseMove(
  board: Board,
  ai: Player,
  difficulty: Difficulty,
  rng: Rng = Math.random,
): number {
  const open = emptyCells(board)
  if (open.length === 0) throw new Error('No moves available')

  if (difficulty === 'easy') return pick(open, rng)

  if (difficulty === 'medium') {
    const win = winningMove(board, ai)
    if (win !== null) return win
    const block = winningMove(board, opponent(ai))
    if (block !== null) return block
    if (open.includes(CENTER)) return CENTER
    return pick(open, rng)
  }

  // Every opening is a draw with perfect play, and searching an empty board is
  // the slowest case, so skip straight to the centre or a corner.
  if (open.length === 9) return pick([CENTER, ...CORNERS], rng)
  return pick(optimalMoves(board, ai), rng)
}
