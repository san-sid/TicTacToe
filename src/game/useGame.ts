import { useEffect, useReducer, useState } from 'react'
import { chooseMove } from './ai.ts'
import type { Difficulty } from './ai.ts'
import type { Player } from './board.ts'
import { createState, isAiTurn, isHumanTurn, reducer } from './reducer.ts'
import type { Mode } from './reducer.ts'
import { loadSaved, save } from './storage.ts'

/** How long the computer "thinks", so its move doesn't feel instantaneous. */
const THINK_MS = 450

export function useGame() {
  const [soundEnabled, setSoundEnabled] = useState(() => loadSaved()?.soundEnabled ?? true)
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const saved = loadSaved()
    return createState(saved?.settings, saved?.scores)
  })

  const { mode, difficulty, humanMark, scores, board, turn } = state
  const aiThinking = isAiTurn(state)
  const humanTurn = isHumanTurn(state)

  // The computer plays after a short pause. The cleanup cancels a pending move
  // if the round changes in the meantime (new round, settings change).
  useEffect(() => {
    if (!aiThinking) return
    const timer = window.setTimeout(() => {
      dispatch({ type: 'move', index: chooseMove(board, turn, difficulty), player: turn })
    }, THINK_MS)
    return () => window.clearTimeout(timer)
  }, [aiThinking, board, turn, difficulty])

  useEffect(() => {
    save({ settings: { mode, difficulty, humanMark }, scores, soundEnabled })
  }, [mode, difficulty, humanMark, scores, soundEnabled])

  return {
    state,
    soundEnabled,
    setSoundEnabled,
    humanTurn,
    aiThinking,
    play: (index: number) => {
      if (humanTurn) dispatch({ type: 'move', index, player: turn })
    },
    newRound: () => dispatch({ type: 'newRound' }),
    resetRound: () => dispatch({ type: 'resetRound' }),
    resetScores: () => dispatch({ type: 'resetScores' }),
    setMode: (next: Mode) => dispatch({ type: 'setMode', mode: next }),
    setDifficulty: (next: Difficulty) => dispatch({ type: 'setDifficulty', difficulty: next }),
    setHumanMark: (mark: Player) => dispatch({ type: 'setHumanMark', mark }),
  }
}
