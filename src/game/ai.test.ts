import { describe, expect, it } from 'vitest'
import { chooseMove, optimalMoves } from './ai.ts'
import type { Board, Cell, Player } from './board.ts'
import { emptyBoard, emptyCells, findWin, isFull, opponent, place } from './board.ts'

const parse = (layout: string): Board =>
  [...layout].map((char): Cell => (char === 'X' || char === 'O' ? char : null))

/**
 * Exhaustively plays every possible opponent move against the AI's optimal
 * replies, and counts the games the AI loses. For a correct minimax it is zero.
 */
function countAiLosses(board: Board, turn: Player, ai: Player): number {
  const win = findWin(board)
  if (win) return win.winner === ai ? 0 : 1
  if (isFull(board)) return 0

  const moves = turn === ai ? optimalMoves(board, ai) : emptyCells(board)
  return moves.reduce(
    (losses, index) => losses + countAiLosses(place(board, index, turn), opponent(turn), ai),
    0,
  )
}

describe('chooseMove', () => {
  it('always returns an open square on every difficulty', () => {
    const board = parse('XO.XO....')
    for (const difficulty of ['easy', 'medium', 'unbeatable'] as const) {
      for (let i = 0; i < 20; i++) {
        expect(emptyCells(board)).toContain(chooseMove(board, 'O', difficulty))
      }
    }
  })

  it('throws when there is nowhere to play', () => {
    expect(() => chooseMove(parse('XOXXOOOXX'), 'X', 'unbeatable')).toThrow()
  })

  it('medium takes a win when one is available', () => {
    // O can finish the top row at square 2.
    expect(chooseMove(parse('OO.XX....'), 'O', 'medium')).toBe(2)
  })

  it('medium blocks the opponent when it cannot win', () => {
    // X threatens the top row, so O must play square 2.
    expect(chooseMove(parse('XX..O....'), 'O', 'medium')).toBe(2)
  })

  it('unbeatable takes a win when one is available', () => {
    expect(chooseMove(parse('OO.XX....'), 'O', 'unbeatable')).toBe(2)
  })

  it('unbeatable blocks a threat', () => {
    expect(chooseMove(parse('XX..O....'), 'O', 'unbeatable')).toBe(2)
  })

  it('unbeatable never loses when it moves second', () => {
    expect(countAiLosses(emptyBoard(), 'X', 'O')).toBe(0)
  })

  it('unbeatable never loses when it moves first', () => {
    expect(countAiLosses(emptyBoard(), 'X', 'X')).toBe(0)
  })
})
