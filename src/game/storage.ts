import type { Difficulty } from './ai.ts'
import type { Scores, Settings } from './reducer.ts'

const KEY = 'xo:v1'

export interface Saved {
  settings: Settings
  scores: Scores
}

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const isDifficulty = (value: unknown): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'unbeatable'

/** Parses stored JSON, returning null unless every field is valid. */
export function parseSaved(raw: string | null): Saved | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null

    const { settings, scores } = data as Record<string, Record<string, unknown> | undefined>
    if (!settings || !scores) return null

    const { mode, difficulty, humanMark } = settings
    if (mode !== 'ai' && mode !== 'local') return null
    if (!isDifficulty(difficulty)) return null
    if (humanMark !== 'X' && humanMark !== 'O') return null

    const { X, O, draws } = scores
    if (!isCount(X) || !isCount(O) || !isCount(draws)) return null

    return { settings: { mode, difficulty, humanMark }, scores: { X, O, draws } }
  } catch {
    return null
  }
}

// Storage can be unavailable (private windows, blocked cookies), so every
// access is wrapped and the game simply works without saving.
export function loadSaved(): Saved | null {
  try {
    return parseSaved(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function save(saved: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // Ignore: saving is a convenience, not a requirement.
  }
}
