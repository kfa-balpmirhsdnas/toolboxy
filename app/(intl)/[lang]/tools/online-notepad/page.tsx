'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('online-notepad')!
const STORAGE_KEY = 'toolboxy-notepad-v2'      // { docs, activeId }
const PREFS_KEY = 'toolboxy-notepad-prefs'     // { fontSize, fontFam, lineH }
const OLD_KEY = 'toolboxy-notepad'             // legacy single-note string
type Doc = { id: string; name: string; text: string }
type Lvl = 'sm' | 'md' | 'lg'
type Fam = 'mono' | 'sans' | 'serif'
const uid = () => Math.random().toString(36).slice(2, 9)
// Tab title = today's date as YYMMDD (e.g. 260628).
const dateTag = () => {
  const d = new Date()
  return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

const SIZE_CLS: Record<Lvl, string> = { sm: 'text-[13px]', md: 'text-[15px]', lg: 'text-[18px]' }
const FAM_CLS: Record<Fam, string> = { mono: 'font-mono', sans: 'font-sans', serif: 'font-serif' }
const LH_CLS: Record<Lvl, string> = { sm: 'leading-snug', md: 'leading-relaxed', lg: 'leading-loose' }

export default function OnlineNotepadPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const first = useRef<Doc>({ id: uid(), name: dateTag(), text: '' }).current

  const [docs, setDocs] = useState<Doc[]>([first])
  const [activeId, setActiveId] = useState(first.id)
  const [savedAt, setSavedAt] = useState('')
  const [copied, setCopied] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<Lvl>('md')
  const [fontFam, setFontFam] = useState<Fam>('mono')
  const [lineH, setLineH] = useState<Lvl>('md')
  const tracked = useRef(false)
  const histories = useRef<Record<string, { hist: string[]; idx: number }>>({ [first.id]: { hist: [''], idx: 0 } })
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ready = useRef(false)
  const [, force] = useState(0)

  const active = docs.find((d) => d.id === activeId) ?? docs[0]
  const text = active?.text ?? ''

  // Unique auto name: 260628, then 260628_2, 260628_3 …
  function uniqueName(existing: Doc[]) {
    const base = dateTag()
    const used = new Set(existing.map((d) => d.name))
    if (!used.has(base)) return base
    let i = 2; while (used.has(`${base}_${i}`)) i++; return `${base}_${i}`
  }

  // Restore on mount (+ prefs), migrating the legacy single note if present.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { docs?: Doc[]; activeId?: string }
        if (data.docs?.length) {
          setDocs(data.docs)
          setActiveId(data.docs.some((d) => d.id === data.activeId) ? data.activeId! : data.docs[0].id)
          const h: Record<string, { hist: string[]; idx: number }> = {}
          for (const d of data.docs) h[d.id] = { hist: [d.text], idx: 0 }
          histories.current = h
        }
      } else {
        const old = localStorage.getItem(OLD_KEY)
        if (old) {
          setDocs((ds) => ds.map((d) => (d.id === first.id ? { ...d, text: old } : d)))
          histories.current[first.id] = { hist: [old], idx: 0 }
        }
      }
      const p = localStorage.getItem(PREFS_KEY)
      if (p) { const pr = JSON.parse(p); if (pr.fontSize) setFontSize(pr.fontSize); if (pr.fontFam) setFontFam(pr.fontFam); if (pr.lineH) setLineH(pr.lineH) }
    } catch { /* ignore */ }
    ready.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Autosave (debounced) — stamp the save time for the indicator.
  useEffect(() => {
    if (!ready.current) return
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ docs, activeId }))
        setSavedAt(new Date().toLocaleTimeString(params.lang, { hour: '2-digit', minute: '2-digit', hour12: false }))
      } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(id)
  }, [docs, activeId, params.lang])

  // Persist display preferences.
  useEffect(() => {
    if (!ready.current) return
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ fontSize, fontFam, lineH })) } catch { /* ignore */ }
  }, [fontSize, fontFam, lineH])

  function setDocText(id: string, v: string) { setSavedAt(''); setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, text: v } : d))) }

  function commit(v: string) {
    const h = histories.current[activeId]; if (!h) return
    if (h.hist[h.idx] === v) return
    h.hist = h.hist.slice(0, h.idx + 1); h.hist.push(v); if (h.hist.length > 200) h.hist.shift()
    h.idx = h.hist.length - 1; force((n) => n + 1)
  }
  function onChange(v: string) {
    setDocText(activeId, v)
    if (commitTimer.current) clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => commit(v), 500)
    if (!tracked.current) { trackToolUsed('online-notepad'); tracked.current = true }
  }
  function undo() {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commit(text) }
    const h = histories.current[activeId]; if (!h || h.idx <= 0) return
    h.idx -= 1; setDocText(activeId, h.hist[h.idx]); force((n) => n + 1)
  }
  function redo() {
    const h = histories.current[activeId]; if (!h || h.idx >= h.hist.length - 1) return
    h.idx += 1; setDocText(activeId, h.hist[h.idx]); force((n) => n + 1)
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey; const k = e.key.toLowerCase()
    if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
  }

  // Tabs
  function addDoc() {
    const d: Doc = { id: uid(), name: uniqueName(docs), text: '' }
    histories.current[d.id] = { hist: [''], idx: 0 }
    setDocs((ds) => [...ds, d]); setActiveId(d.id)
  }
  function closeDoc(id: string) {
    const d = docs.find((x) => x.id === id)
    if (d && d.text.trim() && !window.confirm(t('np_close_confirm'))) return
    delete histories.current[id]
    const rest = docs.filter((x) => x.id !== id)
    if (rest.length === 0) {
      const nd: Doc = { id: uid(), name: uniqueName([]), text: '' }
      histories.current[nd.id] = { hist: [''], idx: 0 }
      setDocs([nd]); setActiveId(nd.id); return
    }
    if (id === activeId) {
      const i = docs.findIndex((x) => x.id === id)
      setActiveId((rest[i] ?? rest[rest.length - 1]).id)
    }
    setDocs(rest)
  }
  function renameDoc(id: string, name: string) { setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, name: name || d.name } : d))) }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(active?.name || 'notes').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  function copy() {
    if (!text) return
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  function clear() {
    if (!text) return
    if (!window.confirm(t('np_clearconfirm'))) return
    setDocText(activeId, ''); commit('')
  }

  const chars = text.length
  const lines = text ? text.split(/\n/).length : 0
  const h = histories.current[activeId]
  const dirty = h ? text !== h.hist[h.idx] : false
  const canUndo = h ? h.idx > 0 || dirty : false
  const canRedo = h ? h.idx < h.hist.length - 1 : false

  const iconBtn = 'p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
  const seg = (on: boolean) => 'px-2 py-0.5 rounded text-xs transition-colors ' + (on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        {/* Tabs — one document per tab (auto-named by date) */}
        <div className="flex items-stretch gap-1 overflow-x-auto border-b border-gray-200">
          {docs.map((d) => {
            const on = d.id === activeId
            return (
              <div key={d.id} onClick={() => setActiveId(d.id)} onDoubleClick={() => setRenaming(d.id)}
                className={'group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-sm cursor-pointer border border-b-0 -mb-px whitespace-nowrap ' +
                  (on ? 'bg-white border-gray-200 text-brand-700 font-semibold' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100')}>
                {renaming === d.id ? (
                  <input autoFocus defaultValue={d.name}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => { renameDoc(d.id, e.target.value.trim()); setRenaming(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { renameDoc(d.id, (e.target as HTMLInputElement).value.trim()); setRenaming(null) } if (e.key === 'Escape') setRenaming(null) }}
                    className="w-24 px-1 text-sm border border-brand-300 rounded outline-none" />
                ) : (
                  <span className="max-w-[10rem] truncate">{d.name}</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); closeDoc(d.id) }} aria-label={t('np_closetab')}
                  className="text-gray-400 hover:text-red-500 text-base leading-none">×</button>
              </div>
            )
          })}
          <button onClick={addDoc} title={t('np_newtab')} aria-label={t('np_newtab')}
            className="shrink-0 px-2.5 py-1.5 text-gray-400 hover:text-brand-600 text-lg leading-none">+</button>
        </div>

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
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_chars', { n: chars })}</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_lines', { n: lines })}</span>
            </div>
          </div>
          <span className={'text-xs font-medium transition-colors ' + (savedAt ? 'text-green-600' : 'text-gray-400')}>
            {savedAt ? `✓ ${t('np_autosaved')} ${savedAt}` : t('np_saving')}
          </span>
        </div>

        {/* Display settings */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span className="mr-0.5">{t('np_font')}</span>
            <button onClick={() => setFontFam('mono')} className={seg(fontFam === 'mono')}>{t('np_font_mono')}</button>
            <button onClick={() => setFontFam('sans')} className={seg(fontFam === 'sans')}>{t('np_font_sans')}</button>
            <button onClick={() => setFontFam('serif')} className={seg(fontFam === 'serif')}>{t('np_font_serif')}</button>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-0.5">{t('np_size')}</span>
            {(['sm', 'md', 'lg'] as Lvl[]).map((s) => <button key={s} onClick={() => setFontSize(s)} className={seg(fontSize === s)}>{t('np_' + s)}</button>)}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-0.5">{t('np_lineheight')}</span>
            {(['sm', 'md', 'lg'] as Lvl[]).map((s) => <button key={s} onClick={() => setLineH(s)} className={seg(lineH === s)}>{t('np_' + s)}</button>)}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('np_placeholder')}
          spellCheck={false}
          className={`w-full h-[56vh] min-h-72 p-4 border border-gray-200 rounded-xl text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 ${SIZE_CLS[fontSize]} ${FAM_CLS[fontFam]} ${LH_CLS[lineH]}`}
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
