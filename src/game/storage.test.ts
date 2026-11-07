import { describe, expect, it } from 'vitest'
import { parseSaved } from './storage.ts'

const valid = {
  settings: { mode: 'ai', difficulty: 'unbeatable', humanMark: 'O' },
  scores: { X: 3, O: 1, draws: 2 },
  soundEnabled: true,
  hapticsEnabled: true,
}

describe('parseSaved', () => {
  it('reads valid data', () => {
    expect(parseSaved(JSON.stringify(valid))).toEqual(valid)
  })

  it('defaults sound effects on for previously saved games', () => {
    const { soundEnabled: _soundEnabled, hapticsEnabled: _hapticsEnabled, ...legacy } = valid
    expect(parseSaved(JSON.stringify(legacy))).toMatchObject({
      soundEnabled: true,
      hapticsEnabled: true,
    })
  })

  it('returns null when nothing is stored', () => {
    expect(parseSaved(null)).toBeNull()
    expect(parseSaved('')).toBeNull()
  })

  it('returns null for corrupt JSON', () => {
    expect(parseSaved('{not json')).toBeNull()
  })

  it('returns null for unexpected shapes and values', () => {
    expect(parseSaved('42')).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, settings: { ...valid.settings, mode: 'online' } }))).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, settings: { ...valid.settings, difficulty: 'hard' } }))).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, scores: { X: -1, O: 0, draws: 0 } }))).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, scores: { X: 1.5, O: 0, draws: 0 } }))).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, soundEnabled: 'yes' }))).toBeNull()
    expect(parseSaved(JSON.stringify({ ...valid, hapticsEnabled: 'yes' }))).toBeNull()
    expect(parseSaved(JSON.stringify({ settings: valid.settings }))).toBeNull()
  })
})
