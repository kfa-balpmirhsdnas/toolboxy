'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('online-notepad')!
const STORAGE_KEY = 'toolboxy-notepad'

export default function OnlineNotepadPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  // Undo/redo history. The textarea is React-controlled, which breaks the
  // browser's native Ctrl+Z, so we keep our own snapshot stack. Typing is
  // coalesced into a snapshot ~500ms after it stops, so undo reverts in chunks.
  const histRef = useRef<string[]>([''])
  const idxRef = useRef(0)
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, force] = useState(0)

  function commit(v: string) {
    if (histRef.current[idxRef.current] === v) return
    histRef.current = histRef.current.slice(0, idxRef.current + 1)
    histRef.current.push(v)
    if (histRef.current.length > 200) histRef.current.shift() // cap memory
    idxRef.current = histRef.current.length - 1
    force((n) => n + 1)
  }

  // Restore on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) { setText(stored); histRef.current = [stored]; idxRef.current = 0 }
    } catch { /* ignore */ }
  }, [])

  // Autosave (debounced) whenever text changes
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text)
        setSaved(true)
      } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(id)
  }, [text])

  function onChange(v: string) {
    setText(v)
    setSaved(false)
    if (commitTimer.current) clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => commit(v), 500)
    if (!tracked.current) { trackToolUsed('online-notepad'); tracked.current = true }
  }

  function undo() {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commit(text) }
    if (idxRef.current <= 0) return
    idxRef.current -= 1
    setText(histRef.current[idxRef.current]); setSaved(false); force((n) => n + 1)
  }
  function redo() {
    if (idxRef.current >= histRef.current.length - 1) return
    idxRef.current += 1
    setText(histRef.current[idxRef.current]); setSaved(false); force((n) => n + 1)
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey
    const k = e.key.toLowerCase()
    if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'notes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function copy() {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function clear() {
    if (!text) return
    if (!window.confirm(t('np_clearconfirm'))) return
    setText(''); commit('')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\n/).length : 0
  const dirty = text !== histRef.current[idxRef.current]
  const canUndo = idxRef.current > 0 || dirty
  const canRedo = idxRef.current < histRef.current.length - 1

  const iconBtn = 'p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              <button onClick={undo} disabled={!canUndo} title={t('np_undo')} aria-label={t('np_undo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg>
              </button>
              <button onClick={redo} disabled={!canRedo} title={t('np_redo')} aria-label={t('np_redo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg>
              </button>
            </div>
            <span className="w-px h-5 bg-gray-200" />
            <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_words', { n: words })}</span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_chars', { n: chars })}</span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_lines', { n: lines })}</span>
            </div>
          </div>
          <span className={'text-xs font-medium transition-colors ' + (saved ? 'text-green-600' : 'text-gray-400')}>
            {saved ? '✓ ' + t('np_autosaved') : t('np_saving')}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('np_placeholder')}
          spellCheck={false}
          className="w-full h-[60vh] min-h-72 p-4 border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
        />

        <div className="flex gap-2 flex-wrap">
          <button onClick={download} disabled={!text}
            className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ⬇ {t('np_download')}
          </button>
          <button onClick={copy} disabled={!text}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {copied ? '✓ ' + t('np_copied') : t('ui_copy')}
          </button>
          <button onClick={clear} disabled={!text}
            className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto">
            {t('ui_clear')}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">{t('np_note')}</p>
      </div>
    </ToolLayout>
  )
}
