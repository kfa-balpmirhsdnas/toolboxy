'use client'

import { useEffect } from 'react'

// Input types whose text can be selected (so tapping a field that comes
// prefilled with sample text selects it all → typing replaces it in one go).
const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel', 'number', 'password'])

/**
 * Global UX helper: the FIRST time a text field is focused (tapped), if it has
 * prefilled sample text, select it all so the next keystroke replaces the whole
 * value instead of appending. Only the first focus per field selects — later
 * focuses keep the normal caret so editing the user's own text isn't disrupted.
 * Mounted once in the locale layout; no per-tool changes needed.
 */
export default function SelectSampleOnFocus() {
  useEffect(() => {
    const seen = new WeakSet<Element>()

    function handle(e: FocusEvent) {
      const el = e.target as HTMLElement | null
      if (!el) return
      const tag = el.tagName
      const isField =
        tag === 'TEXTAREA' ||
        (tag === 'INPUT' && TEXT_INPUT_TYPES.has((el as HTMLInputElement).type))
      if (!isField) return
      const field = el as HTMLInputElement | HTMLTextAreaElement
      if (field.readOnly || field.disabled || seen.has(field)) return
      seen.add(field)
      if (!field.value) return
      // Defer so the browser's own caret placement on tap/click doesn't undo it.
      setTimeout(() => {
        try { field.select() } catch { /* some input types don't support select() */ }
      }, 0)
    }

    document.addEventListener('focusin', handle)
    return () => document.removeEventListener('focusin', handle)
  }, [])

  return null
}
