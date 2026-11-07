import type { Difficulty } from './ai.ts'
import type { Board, Line, Player } from './board.ts'
import { emptyBoard, findWin, isFull, opponent, place } from './board.ts'

export type Mode = 'ai' | 'local'
export type Status = 'playing' | 'won' | 'draw'

export interface Scores {
  X: number
  O: number
  draws: number
}

export interface Settings {
  mode: Mode
  difficulty: Difficulty
  /** The mark the person plays when facing the computer. */
  humanMark: Player
}

export interface GameState extends Settings {
  board: Board
  turn: Player
  /** Who opened the current round. Alternates every round. */
  starter: Player
  status: Status
  winner: Player | null
  winLine: Line | null
  scores: Scores
}

export type Action =
  /** `player` is who is moving, so a late or duplicate dispatch can be ignored. */
  | { type: 'move'; index: number; player: Player }
  | { type: 'newRound' }
  | { type: 'resetRound' }
  | { type: 'setMode'; mode: Mode }
  | { type: 'setDifficulty'; difficulty: Difficulty }
  | { type: 'setHumanMark'; mark: Player }
  | { type: 'resetScores' }

export const defaultSettings: Settings = {
  mode: 'ai',
  difficulty: 'medium',
  humanMark: 'X',
}

export const zeroScores = (): Scores => ({ X: 0, O: 0, draws: 0 })

export function createState(
  settings: Settings = defaultSettings,
  scores: Scores = zeroScores(),
  starter: Player = 'X',
): GameState {
  return {
    ...settings,
    board: emptyBoard(),
    turn: starter,
    starter,
    status: 'playing',
    winner: null,
    winLine: null,
    scores,
  }
}

const settingsOf = ({ mode, difficulty, humanMark }: GameState): Settings => ({
  mode,
  difficulty,
  humanMark,
})

const addWin = (scores: Scores, winner: Player): Scores =>
  winner === 'X' ? { ...scores, X: scores.X + 1 } : { ...scores, O: scores.O + 1 }

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'move': {
      if (state.status !== 'playing' || action.player !== state.turn) return state

      const board = place(state.board, action.index, state.turn)
      if (board === state.board) return state

      const win = findWin(board)
      if (win) {
        return {
          ...state,
          board,
          status: 'won',
          winner: win.winner,
          winLine: win.line,
          scores: addWin(state.scores, win.winner),
        }
      }
      if (isFull(board)) {
        return {
          ...state,
          board,
          status: 'draw',
          scores: { ...state.scores, draws: state.scores.draws + 1 },
        }
      }
      return { ...state, board, turn: opponent(state.turn) }
    }

    case 'newRound':
      return createState(settingsOf(state), state.scores, opponent(state.starter))

    case 'resetRound':
      return createState(settingsOf(state), state.scores, state.starter)

    // Changing what is being played starts a fresh match with a clean scoreboard.
    case 'setMode':
      if (action.mode === state.mode) return state
      return createState({ ...settingsOf(state), mode: action.mode })

    case 'setDifficulty':
      if (action.difficulty === state.difficulty) return state
      return createState({ ...settingsOf(state), difficulty: action.difficulty })

    case 'setHumanMark':
      if (action.mark === state.humanMark) return state
      return createState({ ...settingsOf(state), humanMark: action.mark })

    case 'resetScores':
      return { ...state, scores: zeroScores() }
  }
}

/** True when the person (not the computer) is the one who should move next. */
export const isHumanTurn = (state: GameState): boolean =>
  state.status === 'playing' && (state.mode === 'local' || state.turn === state.humanMark)

/** True when it is the computer's move. */
export const isAiTurn = (state: GameState): boolean =>
  state.status === 'playing' && state.mode === 'ai' && state.turn !== state.humanMark
