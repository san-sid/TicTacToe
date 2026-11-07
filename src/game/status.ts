import type { GameState } from './reducer.ts'

/** The one-line message shown under the board. */
export function statusText(state: GameState): string {
  const { status, mode, turn, winner, humanMark } = state

  if (status === 'draw') return "It's a draw"

  if (status === 'won' && winner) {
    if (mode === 'local') return `${winner} wins`
    return winner === humanMark ? 'You win' : 'Computer wins'
  }

  if (mode === 'local') return `${turn}'s turn`
  return turn === humanMark ? 'Your turn' : 'Computer is thinking…'
}
