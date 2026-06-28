'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Shared modal overlay. Two things make it robust where a plain `fixed inset-0`
 * div breaks:
 *  1) Rendered through a portal at <body>, so a transformed/filtered ancestor
 *     can't hijack `position: fixed`'s containing block (which offsets the modal
 *     and makes its buttons un-tappable).
 *  2) Sized/positioned to the VISUAL viewport (window.visualViewport), so on
 *     Samsung split-screen / with the mobile keyboard the overlay sits exactly on
 *     the visible window instead of the full-screen layout viewport.
 *
 * Pass your own card as children (give it onClick=stopPropagation); the overlay
 * background click calls onClose.
 */
export default function Modal({
  open, onClose, children, className = '',
}: { open: boolean; onClose?: () => void; children: React.ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [vp, setVp] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    const vv = window.visualViewport
    const update = () => { if (vv) setVp({ top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height }) }
    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    return () => { vv?.removeEventListener('resize', update); vv?.removeEventListener('scroll', update) }
  }, [open])

  if (!mounted || !open) return null

  const style: React.CSSProperties = vp
    ? { position: 'fixed', top: vp.top, left: vp.left, width: vp.width, height: vp.height }
    : { position: 'fixed', inset: 0 }

  return createPortal(
    <div onClick={onClose} style={style}
      className={`z-[1000] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 ${className}`}>
      {children}
    </div>,
    document.body,
  )
}
