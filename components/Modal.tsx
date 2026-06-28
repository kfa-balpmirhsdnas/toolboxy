'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Shared modal overlay, robust where a plain `fixed inset-0` div breaks:
 *  1) Rendered through a portal at <body>, so a transformed/filtered ancestor
 *     can't hijack `position: fixed`'s containing block (which offsets the modal
 *     and makes its buttons un-tappable — e.g. Samsung split-screen).
 *  2) While open it PINS the page (body position:fixed at -scrollY). With the page
 *     frozen at the top, the fixed overlay always covers the visible window no
 *     matter how far the list was scrolled — fixing the "modal opened from a
 *     bottom item won't click" bug from the mobile dynamic toolbar + scroll.
 *
 * Pass your own card as children (give it onClick=stopPropagation); a background
 * click calls onClose.
 */
export default function Modal({
  open, onClose, children, className = '',
}: { open: boolean; onClose?: () => void; children: React.ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const y = window.scrollY
    const b = document.body
    const prev = { position: b.style.position, top: b.style.top, left: b.style.left, right: b.style.right, width: b.style.width, overflow: b.style.overflow }
    b.style.position = 'fixed'; b.style.top = `-${y}px`; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%'; b.style.overflow = 'hidden'
    return () => {
      Object.assign(b.style, prev)
      window.scrollTo(0, y)
    }
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0 }}
      className={`z-[1000] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 ${className}`}>
      {children}
    </div>,
    document.body,
  )
}
