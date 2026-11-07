import { motion } from 'framer-motion'
import type { Line, Player } from '../game/board.ts'

/** The board is drawn in a 300 x 300 space, so each square is 100 wide with its centre at 50. */
const center = (index: number) => ({
  x: (index % 3) * 100 + 50,
  y: Math.floor(index / 3) * 100 + 50,
})

/** How far the line extends past the centres of the first and last squares. */
const OVERSHOOT = 28

export function WinLine({ line, winner }: { line: Line; winner: Player }) {
  const start = center(line[0])
  const end = center(line[2])

  const length = Math.hypot(end.x - start.x, end.y - start.y)
  const ux = (end.x - start.x) / length
  const uy = (end.y - start.y) / length

  return (
    <svg
      className={`winline winline--${winner === 'X' ? 'x' : 'o'}`}
      viewBox="0 0 300 300"
      aria-hidden="true"
    >
      <motion.line
        x1={start.x - ux * OVERSHOOT}
        y1={start.y - uy * OVERSHOOT}
        x2={end.x + ux * OVERSHOOT}
        y2={end.y + uy * OVERSHOOT}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}
