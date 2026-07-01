'use client'

// Shared dark/white tool toolbar. Clicking the bar's EMPTY space (not a button) toggles its
// theme between dark and white. `children` is a render function given the current `dark` flag
// so the buttons can theme themselves via the toolbarBtn/toolbarDivider helpers below.

import { useState, type ReactNode } from 'react'

/** Toolbar icon-button classes for the current theme; `active` highlights a pressed button. */
export function toolbarBtn(dark: boolean, active = false): string {
  return (
    'inline-flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ' +
    (dark ? 'text-gray-200 ' : 'text-gray-600 ') +
    (active
      ? dark ? 'bg-white/15' : 'bg-gray-300'
      : dark ? 'hover:bg-white/15' : 'hover:bg-gray-200')
  )
}

/** Vertical divider that matches the current theme. */
export function toolbarDivider(dark: boolean): string {
  return 'w-px h-5 mx-1 ' + (dark ? 'bg-white/15' : 'bg-gray-300')
}

export default function ToolbarBar({
  disabled,
  className,
  children,
}: {
  disabled?: boolean
  className?: string
  children: (dark: boolean) => ReactNode
}) {
  const [dark, setDark] = useState(true)
  return (
    <div
      // Toggle only when the bar itself (empty space) is clicked, not a child button.
      onClick={(e) => { if (e.target === e.currentTarget) setDark((d) => !d) }}
      className={
        // Border is always present (transparent in dark) so toggling theme never changes the box size.
        'flex items-center gap-1 flex-wrap rounded-xl px-2 py-1.5 cursor-pointer transition-colors border ' +
        (dark ? 'bg-gray-800 border-transparent' : 'bg-gray-100 border-gray-200') +
        (disabled ? ' opacity-50 pointer-events-none' : '') +
        (className ? ' ' + className : '')
      }
    >
      {children(dark)}
    </div>
  )
}
