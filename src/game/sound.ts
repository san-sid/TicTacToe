type Sound = 'move' | 'win' | 'draw'

const NOTES: Record<Sound, readonly { frequency: number; delay: number }[]> = {
  move: [{ frequency: 520, delay: 0 }],
  win: [
    { frequency: 523, delay: 0 },
    { frequency: 659, delay: 0.08 },
    { frequency: 784, delay: 0.16 },
  ],
  draw: [
    { frequency: 392, delay: 0 },
    { frequency: 330, delay: 0.12 },
  ],
}

let audioContext: AudioContext | null = null
let soundUnlocked = false

export function unlockSoftSounds(): void {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return

  audioContext ??= new window.AudioContext()
  if (audioContext.state === 'running') {
    soundUnlocked = true
    return
  }

  void audioContext.resume().then(
    () => {
      soundUnlocked = true
    },
    (error: unknown) => console.error('Unable to start game sound effects.', error),
  )
}

export async function playSoftSound(sound: Sound): Promise<void> {
  if (!audioContext || !soundUnlocked) return
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch (error) {
      console.error('Unable to start game sound effects.', error)
      return
    }
  }

  const now = audioContext.currentTime
  for (const note of NOTES[sound]) {
    const oscillator = audioContext.createOscillator()
    const volume = audioContext.createGain()
    const start = now + note.delay
    const end = start + (sound === 'move' ? 0.09 : 0.16)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(note.frequency, start)
    volume.gain.setValueAtTime(0.0001, start)
    volume.gain.exponentialRampToValueAtTime(0.11, start + 0.012)
    volume.gain.exponentialRampToValueAtTime(0.0001, end)

    oscillator.connect(volume)
    volume.connect(audioContext.destination)
    oscillator.start(start)
    oscillator.stop(end)
  }
}
