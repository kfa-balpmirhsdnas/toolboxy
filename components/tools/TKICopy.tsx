'use client'
import { useState } from 'react'

// Copy chips for the Three Kingdoms idiom pages: hanja only, or hanja + meaning.
export default function TKICopy({ hanja, withMeaning, labelHanja, labelBoth, labelDone }: {
  hanja: string
  withMeaning: string
  labelHanja: string
  labelBoth: string
  labelDone: string
}) {
  const [done, setDone] = useState<'h' | 'b' | null>(null)
  function copy(text: string, which: 'h' | 'b') {
    navigator.clipboard?.writeText(text).then(() => {
      setDone(which)
      setTimeout(() => setDone(null), 1500)
    })
  }
  const cls = 'px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors'
  return (
    <div className="flex gap-2">
      <button onClick={() => copy(hanja, 'h')} className={cls}>{done === 'h' ? '✓ ' + labelDone : labelHanja}</button>
      <button onClick={() => copy(withMeaning, 'b')} className={cls}>{done === 'b' ? '✓ ' + labelDone : labelBoth}</button>
    </div>
  )
}
