'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('keyboard-test')!

type K = [string, string, number] // code, label, flex weight
const row = (pairs: [string, string][], w = 1): K[] => pairs.map(([c, l]) => [c, l, w])
const ROWS: K[][] = [
  row([['Escape', 'esc'], ['F1', 'F1'], ['F2', 'F2'], ['F3', 'F3'], ['F4', 'F4'], ['F5', 'F5'], ['F6', 'F6'], ['F7', 'F7'], ['F8', 'F8'], ['F9', 'F9'], ['F10', 'F10'], ['F11', 'F11'], ['F12', 'F12']]),
  [...row([['Backquote', '`'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'], ['Minus', '-'], ['Equal', '=']]), ['Backspace', '⌫', 2] as K],
  [['Tab', 'tab', 2] as K, ...row([['KeyQ', 'Q'], ['KeyW', 'W'], ['KeyE', 'E'], ['KeyR', 'R'], ['KeyT', 'T'], ['KeyY', 'Y'], ['KeyU', 'U'], ['KeyI', 'I'], ['KeyO', 'O'], ['KeyP', 'P'], ['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\']])],
  [['CapsLock', 'caps', 2] as K, ...row([['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'], ['KeyF', 'F'], ['KeyG', 'G'], ['KeyH', 'H'], ['KeyJ', 'J'], ['KeyK', 'K'], ['KeyL', 'L'], ['Semicolon', ';'], ['Quote', "'"]]), ['Enter', '⏎', 2] as K],
  [['ShiftLeft', 'shift', 3] as K, ...row([['KeyZ', 'Z'], ['KeyX', 'X'], ['KeyC', 'C'], ['KeyV', 'V'], ['KeyB', 'B'], ['KeyN', 'N'], ['KeyM', 'M'], ['Comma', ','], ['Period', '.'], ['Slash', '/']]), ['ShiftRight', 'shift', 3] as K],
  [['ControlLeft', 'ctrl', 2] as K, ['MetaLeft', '⌘', 1] as K, ['AltLeft', 'alt', 1] as K, ['Space', '', 8] as K, ['AltRight', 'alt', 1] as K, ['ControlRight', 'ctrl', 2] as K, ['ArrowLeft', '←', 1] as K, ['ArrowUp', '↑', 1] as K, ['ArrowDown', '↓', 1] as K, ['ArrowRight', '→', 1] as K],
]
const PREVENT = new Set(['Space', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace'])

export default function KeyboardTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [held, setHeld] = useState<Set<string>>(new Set())
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [last, setLast] = useState<{ key: string; code: string } | null>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (PREVENT.has(e.code)) e.preventDefault()
      setLast({ key: e.key === ' ' ? 'Space' : e.key, code: e.code })
      setHeld((s) => new Set(s).add(e.code))
      setSeen((s) => new Set(s).add(e.code))
    }
    const up = (e: KeyboardEvent) => setHeld((s) => { const n = new Set(s); n.delete(e.code); return n })
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('kb_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('kb_subtitle')}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{t('kb_last')}:</span>
          {last ? <span className="font-mono font-semibold text-gray-800">{last.key} <span className="text-gray-400">({last.code})</span></span> : <span className="text-gray-300">—</span>}
          <button onClick={() => { setSeen(new Set()); setHeld(new Set()); setLast(null) }} className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline">{t('kb_reset')}</button>
        </div>

        <div className="space-y-1 select-none overflow-x-auto">
          {ROWS.map((r, ri) => (
            <div key={ri} className="flex gap-1 min-w-[640px]">
              {r.map(([code, label, w]) => {
                const isHeld = held.has(code), isSeen = seen.has(code)
                return (
                  <div key={code} style={{ flexGrow: w, flexBasis: 0 }}
                    className={`h-9 flex items-center justify-center rounded-md text-xs font-medium border ${isHeld ? 'bg-brand-500 text-white border-brand-600' : isSeen ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                    {label}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-500 inline-block" />{t('kb_pressing')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />{t('kb_tested')}</span>
        </div>
        <p className="text-xs text-gray-400">{t('kb_note')}</p>
      </div>
    </ToolLayout>
  )
}
