const SPARKLES = [
  { x: 8, y: 18, tone: 'blue' },
  { x: 24, y: 7, tone: 'yellow' },
  { x: 43, y: 13, tone: 'red' },
  { x: 67, y: 8, tone: 'blue' },
  { x: 89, y: 22, tone: 'yellow' },
  { x: 94, y: 45, tone: 'red' },
  { x: 87, y: 74, tone: 'blue' },
  { x: 70, y: 91, tone: 'yellow' },
  { x: 48, y: 87, tone: 'red' },
  { x: 26, y: 94, tone: 'blue' },
  { x: 9, y: 76, tone: 'yellow' },
  { x: 4, y: 50, tone: 'red' },
] as const

export function Celebration() {
  return (
    <span className="celebration" aria-hidden="true">
      {SPARKLES.map((sparkle, index) => (
        <span
          key={`${sparkle.x}-${sparkle.y}`}
          className={`celebration__spark celebration__spark--${sparkle.tone}`}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${(index % 4) * 70}ms`,
          }}
        />
      ))}
    </span>
  )
}
