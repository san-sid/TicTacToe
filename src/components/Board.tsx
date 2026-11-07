import { motion } from 'framer-motion'
import type { Board as BoardState, Line, Player } from '../game/board.ts'
import { Celebration } from './Celebration.tsx'
import { Mark } from './Mark.tsx'
import { WinLine } from './WinLine.tsx'

const SQUARE_NAMES = [
  'top left',
  'top center',
  'top right',
  'middle left',
  'center',
  'middle right',
  'bottom left',
  'bottom center',
  'bottom right',
]

interface BoardProps {
  board: BoardState
  winLine: Line | null
  winner: Player | null
  /** False while the computer is moving or the round is over. */
  interactive: boolean
  onPlay: (index: number) => void
}

export function Board({ board, winLine, winner, interactive, onPlay }: BoardProps) {
  return (
    <div
      className="board"
      data-winner={winner === 'X' ? 'x' : winner === 'O' ? 'o' : undefined}
      role="group"
      aria-label="Game board"
    >
      {board.map((cell, index) => {
        const canPlay = interactive && cell === null
        // Once someone wins, fade the squares that aren't part of the line.
        const dimmed = winLine !== null && !winLine.includes(index)

        return (
          <motion.button
            key={index}
            type="button"
            className="cell"
            // aria-disabled (not `disabled`) keeps the square focusable, so
            // keyboard focus isn't lost while the computer is thinking.
            aria-disabled={!canPlay}
            aria-label={`${SQUARE_NAMES[index]}, ${cell ?? 'empty'}`}
            data-dimmed={dimmed}
            onClick={() => {
              if (canPlay) onPlay(index)
            }}
            whileTap={canPlay ? { scale: 0.93 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <span className="cell__face">{cell && <Mark player={cell} />}</span>
          </motion.button>
        )
      })}
      {winLine && winner && <WinLine line={winLine} winner={winner} />}
      {winner && <Celebration />}
    </div>
  )
}
