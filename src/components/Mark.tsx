import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { Player } from '../game/board.ts'

/** Each stroke draws itself in, optionally after a short delay (the `custom` value). */
const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay, duration: 0.3, ease: 'easeOut' as const },
      opacity: { delay, duration: 0.01 },
    },
  }),
}

export function Mark({ player }: { player: Player }) {
  return (
    <svg
      className={`mark mark--${player === 'X' ? 'x' : 'o'}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {player === 'X' ? (
        <>
          <motion.path d="M 27 27 L 73 73" variants={draw} initial="hidden" animate="visible" custom={0} />
          <motion.path d="M 73 27 L 27 73" variants={draw} initial="hidden" animate="visible" custom={0.12} />
        </>
      ) : (
        // Rotated so the circle starts drawing from the top, like a pen stroke.
        <g transform="rotate(-90 50 50)">
          <motion.circle cx="50" cy="50" r="26" variants={draw} initial="hidden" animate="visible" custom={0} />
        </g>
      )}
    </svg>
  )
}
