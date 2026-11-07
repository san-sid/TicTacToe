import { motion } from 'framer-motion'
import type { GameState } from '../game/reducer.ts'

interface Item {
  label: string
  value: number
  tone: 'x' | 'o' | 'neutral'
}

function itemsFor({ mode, humanMark, scores }: GameState): Item[] {
  if (mode === 'local') {
    return [
      { label: 'X', value: scores.X, tone: 'x' },
      { label: 'Draws', value: scores.draws, tone: 'neutral' },
      { label: 'O', value: scores.O, tone: 'o' },
    ]
  }

  const computerMark = humanMark === 'X' ? 'O' : 'X'
  return [
    { label: 'You', value: scores[humanMark], tone: humanMark === 'X' ? 'x' : 'o' },
    { label: 'Draws', value: scores.draws, tone: 'neutral' },
    { label: 'Computer', value: scores[computerMark], tone: computerMark === 'X' ? 'x' : 'o' },
  ]
}

export function Scoreboard({ state }: { state: GameState }) {
  return (
    <div className="scoreboard" role="group" aria-label="Scoreboard">
      {itemsFor(state).map((item) => (
        <div key={item.label} className="score" data-tone={item.tone}>
          <span className="score__label">{item.label}</span>
          {/* Changing the key remounts the number, which replays the small slide-in. */}
          <motion.span
            key={item.value}
            className="score__value"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {item.value}
          </motion.span>
        </div>
      ))}
    </div>
  )
}
