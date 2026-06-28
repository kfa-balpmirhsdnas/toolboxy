'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { loginHref } from '@/lib/auth/redirect'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('online-notepad')!
const STORAGE_KEY = 'toolboxy-notepad-v2'      // { docs, activeId }
const OLD_KEY = 'toolboxy-notepad'             // legacy single-note string
type Lvl = 'sm' | 'md' | 'lg'              // line spacing
type SizeLvl = 'xs' | 'sm' | 'md' | 'lg' | 'xl' // font size (wider range)
type Fam = string
// Per-document settings live on the doc itself so each tab keeps its own look.
// `updatedAt` drives multi-tab conflict resolution (newest write wins per doc).
type Doc = { id: string; name: string; text: string; fam: Fam; size: SizeLvl; lh: Lvl; updatedAt: number }
const uid = () => Math.random().toString(36).slice(2, 9)
// Tab title = today's date as YYMMDD (e.g. 260628).
const dateTag = () => {
  const d = new Date()
  return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

const SIZE_CLS: Record<SizeLvl, string> = { xs: 'text-[11px]', sm: 'text-[13px]', md: 'text-[15px]', lg: 'text-[18px]', xl: 'text-[22px]' }
const LH_CLS: Record<Lvl, string> = { sm: 'leading-snug', md: 'leading-relaxed', lg: 'leading-loose' }
// A system default plus per-language webfonts (Google Fonts). System fonts only
// render on Windows, so webfonts make the picker work on Mac/mobile too — they
// download on any device. Each font carries its Google Fonts spec for lazy load.
const ALLFONTS: Record<string, { css: string; google?: string }> = {
  sans: { css: 'system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Hiragino Sans",sans-serif' },
  ko_noto: { css: "'Noto Sans KR',sans-serif", google: 'Noto+Sans+KR:wght@400;700' },
  ko_myeongjo: { css: "'Nanum Myeongjo',serif", google: 'Nanum+Myeongjo:wght@400;700;800' },
  ko_pen: { css: "'Nanum Pen Script',cursive", google: 'Nanum+Pen+Script' },
  ja_noto: { css: "'Noto Sans JP',sans-serif", google: 'Noto+Sans+JP:wght@400;700' },
  ja_mincho: { css: "'Shippori Mincho',serif", google: 'Shippori+Mincho:wght@400;700' },
  ja_yusei: { css: "'Yusei Magic',sans-serif", google: 'Yusei+Magic' },
  en_inter: { css: "'Inter',sans-serif", google: 'Inter:wght@400;700' },
  en_lora: { css: "'Lora',serif", google: 'Lora:wght@400;700' },
  en_mono: { css: "'Roboto Mono',monospace", google: 'Roboto+Mono:wght@400;700' },
}
const LOCALE_FONTS: Record<string, string[]> = {
  ko: ['sans', 'ko_noto', 'ko_myeongjo', 'ko_pen'],
  ja: ['sans', 'ja_noto', 'ja_mincho', 'ja_yusei'],
  en: ['sans', 'en_inter', 'en_lora', 'en_mono'],
}
const FAM_CSS = (f: Fam) => (ALLFONTS[f] ?? ALLFONTS.sans).css
const DEFAULTS = { fam: 'sans' as Fam, size: 'md' as SizeLvl, lh: 'md' as Lvl }

// --- Multi-tab safety -------------------------------------------------------
// Every tab / installed-app window of this origin shares ONE localStorage key and
// each autosaves its own in-memory snapshot — so a stale instance can overwrite
// another's notes. Before each write we merge with what's on disk: per-doc
// `updatedAt` decides which version wins, and a deletion tombstone (id -> time)
// stops a deleted note from being resurrected by another tab still holding it.
type Tomb = Record<string, number>
const TOMB_TTL = 7 * 24 * 3600 * 1000 // forget tombstones after a week
function mergeState(local: { docs: Doc[]; deleted: Tomb }, remote: { docs?: Doc[]; deleted?: Tomb } | null) {
  const deleted: Tomb = { ...(remote?.deleted || {}) }
  for (const [id, ts] of Object.entries(local.deleted || {})) deleted[id] = Math.max(deleted[id] || 0, ts)
  const cutoff = Date.now() - TOMB_TTL
  for (const id of Object.keys(deleted)) if (deleted[id] < cutoff) delete deleted[id]
  const best = new Map<string, Doc>() // newest version of each doc id wins
  for (const d of [...(remote?.docs || []), ...local.docs]) {
    const cur = best.get(d.id)
    if (!cur || (d.updatedAt || 0) >= (cur.updatedAt || 0)) best.set(d.id, d)
  }
  const seen = new Set<string>()
  const docs: Doc[] = []
  for (const d of [...local.docs, ...(remote?.docs || [])]) { // keep this tab's order, append the rest
    if (seen.has(d.id)) continue
    seen.add(d.id)
    const b = best.get(d.id)!
    if (deleted[b.id] && deleted[b.id] > (b.updatedAt || 0)) continue // deleted after its last edit
    docs.push(b)
  }
  return { docs, deleted }
}

export default function OnlineNotepadPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const first = useRef<Doc>({ id: uid(), name: dateTag(), text: '', ...DEFAULTS, updatedAt: Date.now() }).current

  const [docs, setDocs] = useState<Doc[]>([first])
  const [activeId, setActiveId] = useState(first.id)
  const [savedAt, setSavedAt] = useState('')
  const [copied, setCopied] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const router = useRouter()
  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const tracked = useRef(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const histories = useRef<Record<string, { hist: string[]; idx: number }>>({ [first.id]: { hist: [''], idx: 0 } })
  const deletedRef = useRef<Tomb>({})
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ready = useRef(false)
  const [, force] = useState(0)
  const docsRef = useRef(docs)
  docsRef.current = docs
  const activeIdRef = useRef(activeId)
  activeIdRef.current = activeId

  const active = docs.find((d) => d.id === activeId) ?? docs[0]
  const text = active?.text ?? ''
  const fam = active?.fam ?? DEFAULTS.fam
  const size = active?.size ?? DEFAULTS.size
  const lh = active?.lh ?? DEFAULTS.lh
  const fontList = LOCALE_FONTS[params.lang] ?? LOCALE_FONTS.en

  // Lazily load this locale's webfonts from Google Fonts (one combined request;
  // the @font-face CSS is tiny and the font binaries stream per used glyph-range).
  useEffect(() => {
    if (document.getElementById('np-webfonts')) return
    const fams = fontList.map((v) => ALLFONTS[v]?.google).filter(Boolean)
    if (!fams.length) return
    const pre = document.createElement('link')
    pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = 'anonymous'
    document.head.appendChild(pre)
    const link = document.createElement('link')
    link.id = 'np-webfonts'; link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?' + fams.map((f) => 'family=' + f).join('&') + '&display=swap'
    document.head.appendChild(link)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lang])

  // Unique auto name: 260628, then 260628_2, 260628_3 …
  function uniqueName(existing: Doc[]) {
    const base = dateTag()
    const used = new Set(existing.map((d) => d.name))
    if (!used.has(base)) return base
    let i = 2; while (used.has(`${base}_${i}`)) i++; return `${base}_${i}`
  }

  // Track auth — TXT download is for signed-in users only (the button looks the
  // same for everyone; guests are routed to login when they click it).
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  // Restore on mount, migrating the legacy single note if present.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { docs?: Partial<Doc>[]; activeId?: string; deleted?: Tomb }
        deletedRef.current = data.deleted || {}
        if (data.docs?.length) {
          const restored = data.docs.map((d) => ({ ...DEFAULTS, updatedAt: 0, ...d } as Doc))
          setDocs(restored)
          setActiveId(restored.some((d) => d.id === data.activeId) ? data.activeId! : restored[0].id)
          const h: Record<string, { hist: string[]; idx: number }> = {}
          for (const d of restored) h[d.id] = { hist: [d.text], idx: 0 }
          histories.current = h
        }
      } else {
        const old = localStorage.getItem(OLD_KEY)
        if (old) {
          setDocs((ds) => ds.map((d) => (d.id === first.id ? { ...d, text: old } : d)))
          histories.current[first.id] = { hist: [old], idx: 0 }
        }
      }
    } catch { /* ignore */ }
    ready.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bring another tab's notes into this tab without disrupting active editing
  // (the active doc keeps our newer version via updatedAt during the merge).
  function syncDocs(next: Doc[]) {
    for (const d of next) if (!histories.current[d.id]) histories.current[d.id] = { hist: [d.text], idx: 0 }
    setDocs(next)
  }

  // Autosave (debounced) — merge with what's on disk before writing so we never
  // clobber another tab's docs, then stamp the save time.
  useEffect(() => {
    if (!ready.current) return
    const id = setTimeout(() => {
      try {
        const remote = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        const merged = mergeState({ docs, deleted: deletedRef.current }, remote)
        deletedRef.current = merged.deleted
        const payload = JSON.stringify({ docs: merged.docs, activeId, deleted: merged.deleted })
        if (payload !== localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, payload)
          setSavedAt(new Date().toLocaleTimeString(params.lang, { hour: '2-digit', minute: '2-digit', hour12: false }))
        }
        if (JSON.stringify(merged.docs) !== JSON.stringify(docs)) syncDocs(merged.docs)
      } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, activeId, params.lang])

  // Cross-tab sync: when another tab writes, reconcile (read-only) into ours.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const remote = JSON.parse(e.newValue)
        const merged = mergeState({ docs: docsRef.current, deleted: deletedRef.current }, remote)
        deletedRef.current = merged.deleted
        if (JSON.stringify(merged.docs) !== JSON.stringify(docsRef.current)) syncDocs(merged.docs)
      } catch { /* ignore */ }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Flush the live text to disk the moment the user leaves this instance. We read
  // the DOM value directly — a still-composing IME character (e.g. the last Korean
  // glyph) lives in textarea.value before React state commits it, so this captures
  // it for any other open instance. Goes through the same merge, so it's safe and
  // a no-op when nothing changed.
  function flushNow() {
    try {
      const el = taRef.current
      const aid = activeIdRef.current
      let docs = docsRef.current
      if (el) {
        const live = el.value
        const cur = docs.find((d) => d.id === aid)
        if (cur && cur.text !== live) {
          docs = docs.map((d) => (d.id === aid ? { ...d, text: live, updatedAt: Date.now() } : d))
          docsRef.current = docs
          setDocs(docs)
        }
      }
      const remote = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      const merged = mergeState({ docs, deleted: deletedRef.current }, remote)
      deletedRef.current = merged.deleted
      const payload = JSON.stringify({ docs: merged.docs, activeId: aid, deleted: merged.deleted })
      if (payload !== localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, payload)
        setSavedAt(new Date().toLocaleTimeString(params.lang, { hour: '2-digit', minute: '2-digit', hour12: false }))
      }
    } catch { /* ignore */ }
  }
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flushNow() }
    window.addEventListener('blur', flushNow)
    window.addEventListener('pagehide', flushNow)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('blur', flushNow)
      window.removeEventListener('pagehide', flushNow)
      document.removeEventListener('visibilitychange', onHide)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lang])

  function patchDoc(id: string, p: Partial<Doc>) { setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, ...p, updatedAt: Date.now() } : d))) }
  function setDocText(id: string, v: string) { setSavedAt(''); patchDoc(id, { text: v }) }

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
    const src = docs.find((d) => d.id === activeId) ?? docs[0]
    // A new tab inherits the current tab's font / size / line-spacing.
    const d: Doc = { id: uid(), name: uniqueName(docs), text: '', fam: src?.fam ?? DEFAULTS.fam, size: src?.size ?? DEFAULTS.size, lh: src?.lh ?? DEFAULTS.lh, updatedAt: Date.now() }
    histories.current[d.id] = { hist: [''], idx: 0 }
    setDocs((ds) => [...ds, d]); setActiveId(d.id)
  }
  function closeDoc(id: string) {
    if (!window.confirm(t('np_close_confirm'))) return
    deletedRef.current = { ...deletedRef.current, [id]: Date.now() } // tombstone so other tabs don't resurrect it
    delete histories.current[id]
    const rest = docs.filter((x) => x.id !== id)
    if (rest.length === 0) {
      const nd: Doc = { id: uid(), name: uniqueName([]), text: '', ...DEFAULTS, updatedAt: Date.now() }
      histories.current[nd.id] = { hist: [''], idx: 0 }
      setDocs([nd]); setActiveId(nd.id); return
    }
    if (id === activeId) {
      const i = docs.findIndex((x) => x.id === id)
      setActiveId((rest[i] ?? rest[rest.length - 1]).id)
    }
    setDocs(rest)
  }
  function renameDoc(id: string, name: string) { patchDoc(id, { name: name || docs.find((d) => d.id === id)?.name || dateTag() }) }

  function download() {
    if (user === 'loading') return // still resolving — ignore the click
    if (!user) { router.push(loginHref(params.lang, `/${params.lang}/tools/online-notepad`)); return } // guests must sign in
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
  const selCls = 'rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400'
  // Icon hints matching each setting's nature: a sample glyph (typeface),
  // ↕ (size), ≡ (line spacing).
  const fontIcon = ({ ko: '가', ja: 'あ', en: 'A' } as Record<string, string>)[params.lang] || 'A'
  const ico = (g: string) => <span className="inline-flex w-4 justify-center text-gray-500 text-[13px] font-bold leading-none">{g}</span>

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={wrapRef} className="space-y-3 scroll-mt-20">
        {/* Tabs — one document per tab (auto-named by date).
            overflow-y-hidden stops the phantom 1px vertical scrollbar that
            overflow-x-auto otherwise spawns (its up/down arrows). */}
        <div className="flex items-stretch gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
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

        <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-2">
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              <button onClick={undo} disabled={!canUndo} title={t('np_undo')} aria-label={t('np_undo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg>
              </button>
              <button onClick={redo} disabled={!canRedo} title={t('np_redo')} aria-label={t('np_redo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg>
              </button>
            </div>
            <span className="w-px h-5 bg-gray-200" />
            {/* Per-tab display settings — icon-only (label text dropped to keep the
                row compact across locales); hover/AT meaning via title + aria-label. */}
            <div className="flex items-center gap-x-2.5 gap-y-1.5 flex-wrap text-xs text-gray-500">
              <label className="flex items-center gap-1" title={t('np_font')}>{ico(fontIcon)}
                <select aria-label={t('np_font')} title={t('np_font')} value={fontList.includes(fam) ? fam : 'sans'} onChange={(e) => patchDoc(activeId, { fam: e.target.value })} className={selCls}>
                  {fontList.map((v) => <option key={v} value={v}>{t('np_font_' + v)}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1" title={t('np_size')}>{ico('↕')}
                <select aria-label={t('np_size')} title={t('np_size')} value={size} onChange={(e) => patchDoc(activeId, { size: e.target.value as SizeLvl })} className={selCls}>
                  <option value="xs">{t('np_xs')}</option>
                  <option value="sm">{t('np_sm')}</option>
                  <option value="md">{t('np_md')}</option>
                  <option value="lg">{t('np_lg')}</option>
                  <option value="xl">{t('np_xl')}</option>
                </select>
              </label>
              <label className="flex items-center gap-1" title={t('np_lineheight')}>{ico('≡')}
                <select aria-label={t('np_lineheight')} title={t('np_lineheight')} value={lh} onChange={(e) => patchDoc(activeId, { lh: e.target.value as Lvl })} className={selCls}>
                  <option value="sm">{t('np_sm')}</option>
                  <option value="md">{t('np_md')}</option>
                  <option value="lg">{t('np_lg')}</option>
                </select>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_chars', { n: chars.toLocaleString() })}</span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_lines', { n: lines.toLocaleString() })}</span>
            </div>
            <span className={'text-xs font-medium transition-colors ' + (savedAt ? 'text-green-600' : 'text-gray-400')}>
              {savedAt ? `✓ ${t('np_autosaved')} ${savedAt}` : t('np_saving')}
            </span>
          </div>
        </div>

        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionEnd={flushNow}
          onFocus={() => { if (window.innerWidth >= 640) wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} // mobile: let the keyboard's native scroll handle it (ours overshoots)
          placeholder={t('np_placeholder')}
          spellCheck={false}
          style={{ fontFamily: FAM_CSS(fam) }}
          className={`w-full h-[56vh] min-h-72 p-4 border border-gray-200 rounded-xl text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 ${SIZE_CLS[size]} ${LH_CLS[lh]}`}
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
