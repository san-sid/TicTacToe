import { motion } from 'framer-motion'
import { useId } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  /** Accessible name for the whole control. */
  label: string
  options: readonly Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** An iOS-style segmented control with a sliding highlight. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  // Each control needs its own id so the sliding pills don't animate between controls.
  const id = useId()

  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className="segmented__item"
            data-active={active}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="segmented__pill"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="segmented__label">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
