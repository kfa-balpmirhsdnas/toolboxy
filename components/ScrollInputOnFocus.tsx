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
      // opt-out: fields (or their containers) marked data-no-scroll-focus stay put
      if (el.closest('[data-no-scroll-focus]')) return
      const tag = el.tagName
      const isField =
        tag === 'TEXTAREA' ||
        (tag === 'INPUT' && TEXT_TYPES.has((el as HTMLInputElement).type))
      if (!isField) return
      // defer so the keyboard begins opening and layout settles first
      setTimeout(() => {
        // Convention: scroll the tool CARD into view — its scroll-mt-16 clears the fixed
        // header. Always scrollIntoView, never window.scrollTo offset math (which over-shot
        // and yanked fields too far up). Fall back to the field if there's no card ancestor.
        const card = (el.closest('.scroll-mt-16') as HTMLElement | null) ?? el
        if (card.getBoundingClientRect().top > HEADER_OFFSET + 8) card.scrollIntoView({ block: 'start' })
      }, 250)
    }
    document.addEventListener('focusin', handle)
    return () => document.removeEventListener('focusin', handle)
  }, [])

  return null
}
