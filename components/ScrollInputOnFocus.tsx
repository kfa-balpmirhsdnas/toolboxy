'use client'

import { useEffect } from 'react'

// Input types that get the on-screen keyboard (and so benefit from scrolling up).
const TEXT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel', 'number', 'password', ''])

/**
 * Global mobile UX helper: when a text field is focused on a small screen, scroll
 * it up to just below the sticky header so it isn't hidden behind the on-screen
 * keyboard / pushed off-screen. Only acts on mobile, and only when the field is
 * meaningfully below the top (so fields already near the top don't jump).
 * Mounted once in the locale layout — no per-tool changes needed.
 */
const HEADER_OFFSET = 64

export default function ScrollInputOnFocus() {
  useEffect(() => {
    function handle(e: FocusEvent) {
      // mobile only (phones / small tablets)
      if (!window.matchMedia('(max-width: 768px)').matches) return
      const el = e.target as HTMLElement | null
      if (!el) return
      const tag = el.tagName
      const isField =
        tag === 'TEXTAREA' ||
        (tag === 'INPUT' && TEXT_TYPES.has((el as HTMLInputElement).type))
      if (!isField) return
      // defer so the keyboard begins opening and layout settles first
      setTimeout(() => {
        const top = el.getBoundingClientRect().top
        if (top <= HEADER_OFFSET + 8) return // already at/near the top — don't jump
        window.scrollTo({ top: top + window.scrollY - HEADER_OFFSET, behavior: 'smooth' })
      }, 250)
    }
    document.addEventListener('focusin', handle)
    return () => document.removeEventListener('focusin', handle)
  }, [])

  return null
}
