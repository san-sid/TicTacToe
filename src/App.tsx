import { AnimatePresence, motion } from 'framer-motion'
import { Board } from './components/Board.tsx'
import { Scoreboard } from './components/Scoreboard.tsx'
import { Segmented } from './components/Segmented.tsx'
import type { Difficulty } from './game/ai.ts'
import type { Player } from './game/board.ts'
import type { Mode } from './game/reducer.ts'
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

  const handlePlay = (index: number) => {
    game.play(index)
    // A tiny tap of haptic feedback where the browser supports it (e.g. Android).
    navigator.vibrate?.(8)
  }

  // The game comes first and the settings sit below it. That keeps the board and
  // the "Play again" button on screen on small phones, and means changing a
  // setting never moves the board.
  return (
    <main className="app">
      <header className="header">
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
