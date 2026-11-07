import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Board } from './components/Board.tsx'
import { Scoreboard } from './components/Scoreboard.tsx'
import { Segmented } from './components/Segmented.tsx'
import type { Difficulty } from './game/ai.ts'
import type { Player } from './game/board.ts'
import type { Mode } from './game/reducer.ts'
import { playSoftSound, unlockSoftSounds } from './game/sound.ts'
import { statusText } from './game/status.ts'
import { useGame } from './game/useGame.ts'

const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'ai', label: 'vs Computer' },
  { value: 'local', label: '2 Players' },
]

const DIFFICULTIES: readonly { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'unbeatable', label: 'Unbeatable' },
]

const MARKS: readonly { value: Player; label: string }[] = [
  { value: 'X', label: 'Play as X' },
  { value: 'O', label: 'Play as O' },
]

export default function App() {
  const game = useGame()
  const { state } = game

  const message = statusText(state)
  const roundOver = state.status !== 'playing'
  const hasScores = state.scores.X + state.scores.O + state.scores.draws > 0
  const previousBoard = useRef(state.board)

  useEffect(() => {
    const changed = previousBoard.current !== state.board
    previousBoard.current = state.board
    if (!changed || !game.soundEnabled || !state.board.some(Boolean)) return

    const sound = state.status === 'won' ? 'win' : state.status === 'draw' ? 'draw' : 'move'
    void playSoftSound(sound)
  }, [game.soundEnabled, state.board, state.status])

  const handlePlay = (index: number) => {
    if (game.soundEnabled) unlockSoftSounds()
    game.play(index)
    if (game.hapticsEnabled) navigator.vibrate?.(8)
  }

  // The game comes first and the settings sit below it. That keeps the board and
  // the "Play again" button on screen on small phones, and means changing a
  // setting never moves the board.
  return (
    <main className="app">
      <header className="header">
        <div className="preference-controls" role="group" aria-label="Game preferences">
          <button
            type="button"
            className="preference-icon"
            data-enabled={game.soundEnabled}
            aria-label={`Sound effects ${game.soundEnabled ? 'on' : 'off'}`}
            aria-pressed={game.soundEnabled}
            title={`Sound effects ${game.soundEnabled ? 'on' : 'off'}`}
            onClick={() => {
              const enabled = !game.soundEnabled
              if (enabled) unlockSoftSounds()
              game.setSoundEnabled(enabled)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              {game.soundEnabled ? (
                <>
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </>
              ) : (
                <>
                  <path d="m16 9 5 6" />
                  <path d="m21 9-5 6" />
                </>
              )}
            </svg>
          </button>
          <button
            type="button"
            className="preference-icon"
            data-enabled={game.hapticsEnabled}
            aria-label={`Haptics ${game.hapticsEnabled ? 'on' : 'off'}`}
            aria-pressed={game.hapticsEnabled}
            title={`Haptics ${game.hapticsEnabled ? 'on' : 'off'}`}
            onClick={() => game.setHapticsEnabled(!game.hapticsEnabled)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="7" y="3" width="10" height="18" rx="2" />
              <path d="M10 6h4M10 18h4" />
              {game.hapticsEnabled && (
                <>
                  <path d="M4 8a7 7 0 0 0 0 8" />
                  <path d="M20 8a7 7 0 0 1 0 8" />
                </>
              )}
            </svg>
          </button>
        </div>
        <h1 className="title">
          <span className="title__x">X</span>
          <span className="title__o">O</span>
        </h1>
        <p className="tagline">Simple. No ads. No tracking.</p>
      </header>

      <Scoreboard state={state} />

      <Board
        board={state.board}
        winLine={state.winLine}
        winner={state.winner}
        interactive={game.humanTurn}
        onPlay={handlePlay}
      />

      <div className="status-area" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            className="status"
            data-tone={state.status === 'won' && state.winner ? state.winner.toLowerCase() : 'neutral'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="actions">
        <motion.button
          key={roundOver ? 'play-again' : 'reset-round'}
          type="button"
          className="button"
          onClick={roundOver ? game.newRound : game.resetRound}
          whileTap={{ scale: 0.96 }}
        >
          {roundOver ? 'Play again' : 'Reset round'}
        </motion.button>
      </div>

      <section className="panel" aria-label="Game settings">
        <Segmented label="Game mode" options={MODES} value={state.mode} onChange={game.setMode} />

        <AnimatePresence initial={false}>
          {state.mode === 'ai' && (
            <motion.div
              key="computer-settings"
              className="panel__extra"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="panel__extra-inner">
                <Segmented
                  label="Difficulty"
                  options={DIFFICULTIES}
                  value={state.difficulty}
                  onChange={game.setDifficulty}
                />
                <Segmented
                  label="Your mark"
                  options={MARKS}
                  value={state.humanMark}
                  onChange={game.setHumanMark}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      <footer className="footer">
        <button type="button" className="link" onClick={game.resetScores} disabled={!hasScores}>
          Reset scores
        </button>
        <p className="note">Scores are saved on this device only.</p>
      </footer>
    </main>
  )
}
