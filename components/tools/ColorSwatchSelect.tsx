'use client'

// Shared custom color picker: a button showing the current colour as a swatch, with a
// popup grid of swatches to choose from. Replaces plain <select> colour dropdowns so the
// actual colours are visible. Mirrors the popup pattern used by other tool toolbars.

import { useState } from 'react'

export default function ColorSwatchSelect({
  value,
  onChange,
  colors,
  title,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (c: string) => void
  colors: string[]
  title?: string
  ariaLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'relative ' + (className || '')}>
      {/* Click-away backdrop */}
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={title}
        aria-label={ariaLabel}
        className="h-9 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center gap-1.5"
      >
        <span style={{ background: value }} className="block w-5 h-5 rounded-full border border-black/10" />
        <span className="text-xs text-gray-400">▼</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 grid grid-cols-4 gap-1">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); setOpen(false) }}
              aria-label={c}
              className={'w-7 h-7 rounded-md flex items-center justify-center transition-colors ' + (value === c ? 'ring-2 ring-brand-500 ring-offset-1' : 'hover:bg-gray-100')}
            >
              <span style={{ background: c }} className="block w-5 h-5 rounded-full border border-black/10" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
