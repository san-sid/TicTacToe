import { describe, expect, it } from 'vitest'
import type { Action, GameState } from './reducer.ts'
import { createState, isAiTurn, isHumanTurn, reducer } from './reducer.ts'
import { statusText } from './status.ts'

/** Applies a list of moves (square numbers), alternating X then O. */
function playMoves(state: GameState, squares: number[]): GameState {
  return squares.reduce<GameState>(
    (current, index) => reducer(current, { type: 'move', index, player: current.turn }),
    state,
  )
}

const local = () => createState({ mode: 'local', difficulty: 'medium', humanMark: 'X' })

describe('reducer', () => {
  it('alternates turns', () => {
    const state = playMoves(local(), [0])
    expect(state.turn).toBe('O')
    expect(state.board[0]).toBe('X')
  })

  it('ignores a move on an occupied square', () => {
    const state = playMoves(local(), [0])
    const again = reducer(state, { type: 'move', index: 0, player: 'O' })
    expect(again).toBe(state)
  })

  it('ignores a move from the wrong player', () => {
    const state = local()
    expect(reducer(state, { type: 'move', index: 0, player: 'O' })).toBe(state)
  })

  it('records a win, the winning line and the score', () => {
    // X: 0, 1, 2 across the top. O: 3, 4.
    const state = playMoves(local(), [0, 3, 1, 4, 2])
    expect(state.status).toBe('won')
    expect(state.winner).toBe('X')
    expect(state.winLine).toEqual([0, 1, 2])
    expect(state.scores).toEqual({ X: 1, O: 0, draws: 0 })
  })

  it('stops accepting moves once the round is over', () => {
    const won = playMoves(local(), [0, 3, 1, 4, 2])
    expect(reducer(won, { type: 'move', index: 8, player: won.turn })).toBe(won)
  })

  it('records a draw', () => {
    // X O X
    // X O O
    // O X X
    const state = playMoves(local(), [0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(state.status).toBe('draw')
    expect(state.winner).toBeNull()
    expect(state.scores).toEqual({ X: 0, O: 0, draws: 1 })
  })

  it('starts the next round with the other player and keeps the score', () => {
    const won = playMoves(local(), [0, 3, 1, 4, 2])
    const next = reducer(won, { type: 'newRound' })
    expect(next.status).toBe('playing')
    expect(next.turn).toBe('O')
    expect(next.board.every((cell) => cell === null)).toBe(true)
    expect(next.scores.X).toBe(1)
  })

  it('resets the current round without changing its starter or score', () => {
    const state = playMoves(createState(undefined, { X: 2, O: 1, draws: 3 }), [0, 3])
    const reset = reducer(state, { type: 'resetRound' })
    expect(reset.board.every((cell) => cell === null)).toBe(true)
    expect(reset.turn).toBe(state.starter)
    expect(reset.starter).toBe(state.starter)
    expect(reset.scores).toEqual(state.scores)
    expect(reset.status).toBe('playing')
  })

  it('resets the scoreboard when the mode changes', () => {
    const won = playMoves(local(), [0, 3, 1, 4, 2])
    const next = reducer(won, { type: 'setMode', mode: 'ai' })
    expect(next.mode).toBe('ai')
    expect(next.scores).toEqual({ X: 0, O: 0, draws: 0 })
  })

  it('keeps state when a setting is set to its current value', () => {
    const state = createState()
    const same: Action = { type: 'setDifficulty', difficulty: state.difficulty }
    expect(reducer(state, same)).toBe(state)
  })

  it('resets only the scores', () => {
    const won = playMoves(local(), [0, 3, 1, 4, 2])
    const next = reducer(won, { type: 'resetScores' })
    expect(next.scores).toEqual({ X: 0, O: 0, draws: 0 })
    expect(next.status).toBe('won')
  })
})

describe('turn helpers', () => {
  it('lets the person move first as X against the computer', () => {
    const state = createState({ mode: 'ai', difficulty: 'easy', humanMark: 'X' })
    expect(isHumanTurn(state)).toBe(true)
    expect(isAiTurn(state)).toBe(false)
  })

  it('has the computer open when the person plays O', () => {
    const state = createState({ mode: 'ai', difficulty: 'easy', humanMark: 'O' })
    expect(isHumanTurn(state)).toBe(false)
    expect(isAiTurn(state)).toBe(true)
  })

  it('never hands the move to the computer in two-player mode', () => {
    expect(isAiTurn(local())).toBe(false)
    expect(isHumanTurn(local())).toBe(true)
  })
})

describe('statusText', () => {
  it('describes whose turn it is', () => {
    expect(statusText(createState())).toBe('Your turn')
    expect(statusText(local())).toBe("X's turn")
  })

  it('says when the computer is thinking', () => {
    const state = createState({ mode: 'ai', difficulty: 'easy', humanMark: 'O' })
    expect(statusText(state)).toBe('Computer is thinking…')
  })

  it('announces the winner in two-player mode', () => {
    const won = playMoves(local(), [0, 3, 1, 4, 2])
    expect(statusText(won)).toBe('X wins')
  })

  it('says whether you or the computer won', () => {
    // The same game: X takes the top row while O plays 3 and 4.
    const moves = [0, 3, 1, 4, 2]
    const asX = playMoves(createState({ mode: 'ai', difficulty: 'easy', humanMark: 'X' }), moves)
    const asO = playMoves(createState({ mode: 'ai', difficulty: 'easy', humanMark: 'O' }), moves)
    expect(statusText(asX)).toBe('You win')
    expect(statusText(asO)).toBe('Computer wins')
  })

  it('announces a draw', () => {
    const drawn = playMoves(local(), [0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(statusText(drawn)).toBe("It's a draw")
  })
})
