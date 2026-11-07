import { describe, expect, it } from 'vitest'
import type { Board, Cell } from './board.ts'
import { emptyBoard, emptyCells, findWin, isFull, opponent, place } from './board.ts'

/** Builds a board from a 9-character string, e.g. "XOX.O...." ('.' is empty). */
const parse = (layout: string): Board =>
  [...layout].map((char): Cell => (char === 'X' || char === 'O' ? char : null))

describe('board', () => {
  it('starts empty', () => {
    expect(emptyBoard()).toHaveLength(9)
    expect(emptyCells(emptyBoard())).toHaveLength(9)
  })

  it('swaps players', () => {
    expect(opponent('X')).toBe('O')
    expect(opponent('O')).toBe('X')
  })

  it('places a mark without mutating the original board', () => {
    const before = emptyBoard()
    const after = place(before, 4, 'X')
    expect(after[4]).toBe('X')
    expect(before[4]).toBeNull()
  })

  it('ignores moves on occupied or invalid squares', () => {
    const board = parse('X........')
    expect(place(board, 0, 'O')).toBe(board)
    expect(place(board, -1, 'O')).toBe(board)
    expect(place(board, 9, 'O')).toBe(board)
  })

  it('detects every winning line', () => {
    const wins = ['XXX......', '...XXX...', '......XXX', 'X..X..X..', '.X..X..X.', '..X..X..X', 'X...X...X', '..X.X.X..']
    for (const layout of wins) {
      expect(findWin(parse(layout))?.winner).toBe('X')
    }
  })

  it('reports the winning line for highlighting', () => {
    expect(findWin(parse('OOO.X.X.X'))?.line).toEqual([0, 1, 2])
  })

  it('returns null when nobody has won', () => {
    expect(findWin(parse('XO.......'))).toBeNull()
    expect(findWin(emptyBoard())).toBeNull()
  })

  it('knows when the board is full', () => {
    expect(isFull(parse('XOXXOOOXX'))).toBe(true)
    expect(isFull(parse('XOXXOOOX.'))).toBe(false)
  })
})
