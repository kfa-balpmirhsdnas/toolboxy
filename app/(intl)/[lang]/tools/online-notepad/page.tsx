'use client'

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { loginHref } from '@/lib/auth/redirect'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
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
type Doc = { id: string; name: string; text: string; fam: Fam; size: SizeLvl; lh: Lvl; updatedAt: number; createdAt: number }
const uid = () => Math.random().toString(36).slice(2, 9)
// Tab title = today's date as YYMMDD (e.g. 260628).
const dateTag = () => {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}` // MMDD
}
const fmtDate = (ms: number) => { const d = new Date(ms); return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}` }
const fmtDateFile = (ms: number) => { const d = new Date(ms); return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}` } // YYMMDD for filenames

// Auto-list (single level only). A symbol line may use a shortcut (* o @) or the
// glyph itself; the shortcut is turned into the glyph only on Enter (like numbers).
// Special-character palette — inserted at the caret. Whitespace-split + de-duped.
const CHARS = Array.from(new Set(
  '· … ⁝ ※ • ⸰ ™ → ↑ ↓ ← ↔ ↕ ☜ ☞ ★ ☆ ♥ ♡ ○ ● ◎ □ ■ ☑ ✓ △ ▲ ▽ ▼ ◁ ◀ ▷ ▶ ⏺ ⚫ ☉ ♧ ♣ ♨ ☏ ☎ ♩ ♪ ♬ ♫ ♭ ± × ÷ ≠ ≒ ≈ ∞ ∴ ∵ ⊂ ⊃ ∪ ∩ 【 】 「 」 º ℃ ℉ ㎟ ㎠ ㎡ ㎢ ㎣ ㎤ ㎥ ㎦ ½ ⅓ ⅔ ¼ ¾ ⅛ ⅜ ⅝ ⅞ ¹ ² ³ ⁴ ⁿ ₁ ₂ ₃ ₄ α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ Ⅶ Ⅷ Ⅸ Ⅹ ⅰ ⅱ ⅲ ⅳ ⅴ ⅵ ⅶ ⅷ ⅸ ⅹ'.split(/\s+/).filter(Boolean),
))
const SYM_TO_GLYPH: Record<string, string> = { '*': '●', o: '○', '@': '■', '-': '▶', '●': '●', '○': '○', '■': '■', '▶': '▶' }
const NUM_MARK = /^(\d+)([.)>]) /  // "1. " / "1) " / "1> "
const SYM_MARK = /^([*o@\-▶●○■]) /  // shortcuts (* o @ -) or glyphs (● ○ ■ ▶) + space

// True if `short` is `full` with one contiguous chunk removed (the composing glyph the IME drops
// on a tab transition). Generalises a prefix check so it also catches edits made in the MIDDLE of
// the document (the removed glyph isn't at the end): compare the shared prefix + shared suffix.
function isTruncationOf(full: string, short: string): boolean {
  if (short.length >= full.length) return false
  let p = 0
  while (p < short.length && full[p] === short[p]) p++
  let s = 0
  while (s < short.length - p && full[full.length - 1 - s] === short[short.length - 1 - s]) s++
  return p + s === short.length
}

// Preview renderer: HTML-escape the text (XSS-safe), then turn markdown links [text](url) and bare
// URLs into clickable anchors. No markdown library — links only. The forced http(s) scheme + the
// escaping mean a crafted [x](javascript:…) can't produce a live link or break out of the tag.
const LINK_TLD = 'com|net|org|io|dev|app|ai|co|kr|jp|cn|us|uk|de|fr|it|es|ru|nl|se|no|pl|tr|br|in|au|ca|me|tv|info|biz|xyz|gg|edu|gov|shop|store|site|online|blog'
const LINK_RE = new RegExp(
  `\\[([^\\]]+)\\]\\(((?:https?:\\/\\/|www\\.)[^\\s()<>]+|(?:[a-z0-9-]+\\.)+(?:${LINK_TLD})[^\\s()<>]*)\\)` + // [text](url)
  `|((?:https?:\\/\\/|www\\.)[^\\s()<>]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${LINK_TLD})(?:\\/[^\\s()<>]*)?)`, // bare url
  'gi',
)
function renderPreview(raw: string): string {
  const esc = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return esc.replace(LINK_RE, (_m, mdText: string, mdUrl: string, bareUrl: string) => {
    const url = mdUrl || bareUrl
    const label = mdText || bareUrl
    const href = /^https?:/i.test(url) ? url : 'https://' + url
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-brand-600 underline break-all">${label}</a>`
  })
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

// Compact custom dropdown for the format controls (font / size / line-height). The trigger
// shows the current value; the popup lists the options. A single shared `open` key controls
// which menu is expanded, so opening one closes the others.
function MenuSelect({ id, open, setOpen, selCls, icon, label, options, value, onPick }: {
  id: string; open: string | null; setOpen: (v: string | null) => void; selCls: string
  icon: ReactNode; label: ReactNode; options: { value: string; label: ReactNode }[]
  value: string; onPick: (v: string) => void
}) {
  const isOpen = open === id
  return (
    <div className="relative flex-1 min-w-0 sm:flex-none">
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setOpen(null)} />}
      <button type="button" onClick={() => setOpen(isOpen ? null : id)} className={selCls + ' relative z-20 flex items-center gap-1 w-full'}>
        {icon}
        <span className="truncate flex-1 text-left">{label}</span>
        <span className="shrink-0 text-gray-400 text-[9px]">▾</span>
      </button>
      {isOpen && (
        <div className="absolute z-30 mt-1 left-0 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-xs whitespace-nowrap">
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onPick(o.value); setOpen(null) }}
              className={'block w-full px-3 py-1.5 text-left hover:bg-gray-50 ' + (o.value === value ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-700')}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OnlineNotepadPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const first = useRef<Doc>({ id: uid(), name: dateTag(), text: '', ...DEFAULTS, updatedAt: Date.now(), createdAt: Date.now() }).current

  const [docs, setDocs] = useState<Doc[]>([first])
  const [activeId, setActiveId] = useState(first.id)
  const [savedAt, setSavedAt] = useState('')
  const [savingVisible, setSavingVisible] = useState(false) // "saving…" auto-hides after 3s
  const [copied, setCopied] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [showFind, setShowFind] = useState(false)
  const [showChars, setShowChars] = useState(false) // special-character palette
  const [showSettings, setShowSettings] = useState(false) // mobile: font/size/spacing hidden behind a gear
  const [openMenu, setOpenMenu] = useState<string | null>(null) // which format dropdown is open
  const [preview, setPreview] = useState(false) // edit ↔ preview (renders links clickable)
  // Auto-convert toggles (symbols --- === -> <- / URL links / list markers). Persisted, default on.
  const [autoConv, setAutoConv] = useState({ symbol: true, link: true, bullet: true })
  useEffect(() => {
    try { const s = localStorage.getItem('toolboxy-notepad-ac'); if (s) setAutoConv((p) => ({ ...p, ...JSON.parse(s) })) } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('toolboxy-notepad-ac', JSON.stringify(autoConv)) } catch { /* ignore */ }
  }, [autoConv])
  const [findQ, setFindQ] = useState('')
  const [replaceQ, setReplaceQ] = useState('')
  const [matchInfo, setMatchInfo] = useState('')
  const router = useRouter()
  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const tracked = useRef(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const pendingSel = useRef<{ s: number; e: number } | null>(null) // caret/range to restore after a programmatic text change commits
  const caretRef = useRef({ s: 0, e: 0 }) // caret saved on leave, restored when the window/tab returns (PC)
  // Latest textarea value seen on ANY input event (composition included). When the tab is
  // backgrounded mid-composition, the OS/IME can strip the still-composing Korean glyph from
  // textarea.value before our leave handler reads it — this ref preserves it as a fallback.
  const liveRef = useRef('')
  const composingRef = useRef(false) // true while an IME composition is in progress
  // Value we saved on leave + when. The IME can cancel an active composition around a tab
  // background/foreground and re-fire a SHORTER value; for a short window after each transition we
  // drop such a change so it can't clobber the just-saved last glyph. The window self-expires (time
  // based) so it never blocks genuine editing, and no forced re-render is needed — React restores
  // the controlled value in the DOM when we ignore a change.
  const leaveValRef = useRef('')
  const leaveAtRef = useRef(0)
  const GUARD_MS = 700
  const wrapRef = useRef<HTMLDivElement>(null)
  const tabBarRef = useRef<HTMLDivElement>(null)
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

  // Unique auto name: first of a day is the bare date (0628), then 0628B, 0628C…
  // (no "A" — the first tab already represents the date).
  function uniqueName(existing: Doc[]) {
    const base = dateTag()
    const used = new Set(existing.map((d) => d.name))
    if (!used.has(base)) return base
    for (let i = 0; i < 25; i++) { const c = base + String.fromCharCode(66 + i); if (!used.has(c)) return c } // 0628B, 0628C…Z
    let i = 2; while (used.has(`${base}${i}`)) i++; return `${base}${i}` // beyond Z
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
          const restored = data.docs.map((d) => ({ ...DEFAULTS, updatedAt: 0, ...d, createdAt: d.createdAt ?? d.updatedAt ?? Date.now() } as Doc))
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

  // "Open with → ToolBoxy Notepad" (installed PWA, Chromium desktop): the OS hands us the chosen
  // text file(s) via the File Handling API — read each into its own new tab named after the file.
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      const handles = p?.files || []
      let firstId: string | null = null
      for (const h of handles) {
        try {
          const file = await h.getFile()
          const content = await file.text()
          const base = (file.name.replace(/\.[^.]+$/, '') || 'file').slice(0, 30)
          const cur = docsRef.current
          const name = new Set(cur.map((d) => d.name)).has(base) ? uniqueName(cur) : base
          const d: Doc = { id: uid(), name, text: content, ...DEFAULTS, updatedAt: Date.now(), createdAt: Date.now() }
          histories.current[d.id] = { hist: [content], idx: 0 }
          docsRef.current = [...docsRef.current, d]
          setDocs((ds) => [...ds, d])
          if (!firstId) firstId = d.id
        } catch { /* skip unreadable */ }
      }
      if (firstId) setActiveId(firstId)
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
  function flushNow(liveVal?: string) {
    try {
      const el = taRef.current
      const aid = activeIdRef.current
      let docs = docsRef.current
      if (el) {
        // Prefer the value captured BEFORE blur (composing char is still in it). Never
        // overwrite the current state with a SHORTER value — that only happens when blur
        // reverted an in-progress IME composition, so it would drop the last character.
        const live = typeof liveVal === 'string' ? liveVal : el.value
        const cur = docs.find((d) => d.id === aid)
        if (cur && cur.text !== live && live.length >= cur.text.length) {
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
  // "Saving…" shows while a save is pending, but auto-hides after 3s so a slow/stuck save
  // never leaves the label up indefinitely. The saved "✓" state (savedAt set) is unaffected.
  useEffect(() => {
    if (savedAt) return
    setSavingVisible(true)
    const id = setTimeout(() => setSavingVisible(false), 3000)
    return () => clearTimeout(id)
  }, [savedAt])
  useEffect(() => {
    // Blur the editor first so an in-progress IME composition (the last char) is
    // committed into textarea.value before we read & save it — otherwise that last
    // character can get dropped when focus is lost.
    const pc = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches // mouse device = PC
    const onLeave = () => {
      const el = taRef.current
      if (el) caretRef.current = { s: el.selectionStart, e: el.selectionEnd } // save caret before blur
      // Capture the value BEFORE blur. Prefer whichever is longer between the DOM value and the
      // last value seen on input: backgrounding can already have dropped the composing glyph from
      // el.value, but liveRef still holds it.
      const domVal = el?.value ?? ''
      // Only fall back to liveRef mid-composition (the exact case the OS can drop the glyph) so we
      // never resurrect stale text after a tab switch, undo, or cross-tab sync.
      const live = composingRef.current && liveRef.current.length > domVal.length ? liveRef.current : domVal
      // Do NOT blur: on Windows the Korean IME cancels the active composition on blur and re-fires a
      // shorter value that clobbers the glyph. We already captured the full value above; the
      // time-boxed onChange guard drops any shorter follow-up around the transition.
      leaveValRef.current = live
      leaveAtRef.current = Date.now()
      flushNow(live)
    }
    // PC only: when the window/tab comes back, refocus the editor and restore the caret —
    // unless the user is in another field (tab rename / find). Mobile is skipped to avoid
    // popping up the on-screen keyboard.
    const onShow = () => {
      // Extend the guard window: re-focusing can make the IME cancel the composition and re-fire the
      // truncated value a tick later, so keep dropping shorter values briefly after return too.
      if (leaveValRef.current) leaveAtRef.current = Date.now()
      if (!pc) return
      const ae = document.activeElement
      if (ae && ae !== document.body && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') && ae !== taRef.current) return
      const ta = taRef.current; if (!ta) return
      // Restore focus + caret on PC. No forced re-render — that used to break a still-active
      // composition (the missing 요 case); the guard + React's own controlled-value restore keep the
      // DOM correct.
      ta.focus(); try { ta.setSelectionRange(caretRef.current.s, caretRef.current.e) } catch { /* ignore */ }
    }
    const onVis = () => { if (document.visibilityState === 'hidden') onLeave(); else onShow() }
    window.addEventListener('blur', onLeave)
    window.addEventListener('focus', onShow)
    window.addEventListener('pagehide', onLeave)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('focus', onShow)
      window.removeEventListener('pagehide', onLeave)
      document.removeEventListener('visibilitychange', onVis)
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
    // Within the guard window after a tab transition, drop the shorter value the IME emits when it
    // cancels a composition (it would erase the last glyph we just saved). The window self-expires,
    // so a genuine deletion made later still goes through.
    if (leaveValRef.current && Date.now() - leaveAtRef.current < GUARD_MS
      && isTruncationOf(leaveValRef.current, v)) return
    leaveValRef.current = ''
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
  // Replace the whole text + restore the caret (controlled textarea needs the caret
  // re-applied after React re-renders).
  function applyText(nt: string, caret: number, selEnd?: number) {
    // Stash the caret/range; the layout effect below restores it right after React commits the
    // new controlled value (which otherwise resets the caret to the end).
    pendingSel.current = { s: caret, e: selEnd ?? caret }
    onChange(nt)
  }
  // Restore the pending caret/selection after the textarea's new value is in the DOM (runs
  // before paint, so no flicker and the range survives the controlled-value reset).
  useLayoutEffect(() => {
    const p = pendingSel.current; if (!p) return
    pendingSel.current = null
    const ta = taRef.current; if (!ta) return
    ta.focus(); ta.selectionStart = p.s; ta.selectionEnd = p.e
    // Nudge the caret line into view (programmatic moves don't auto-scroll like keystrokes).
    const nt = ta.value, caret = p.s
    if (nt.indexOf('\n', caret) === -1) { ta.scrollTop = ta.scrollHeight; return }
    const cs = getComputedStyle(ta)
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5
    const top = (parseFloat(cs.paddingTop) || 0) + (nt.slice(0, caret).split('\n').length - 1) * lh
    if (top + lh > ta.scrollTop + ta.clientHeight) ta.scrollTop = top + lh - ta.clientHeight
    else if (top < ta.scrollTop) ta.scrollTop = top
  }, [text])
  // Insert a special character at the caret (replacing any selection).
  function insertChar(ch: string) {
    const ta = taRef.current; if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    applyText(text.slice(0, s) + ch + text.slice(e), s + ch.length)
  }
  // Re-sequence the contiguous numbered block (same delimiter) around the caret to 1,2,3…
  function renumberAt(full: string, caret: number, delim: string) {
    const d = delim === ')' ? '\\)' : delim === '.' ? '\\.' : '>'
    const re = new RegExp(`^(\\d+)${d} `)
    const lines = full.split('\n')
    let acc = 0, cl = 0, cc = 0
    for (let i = 0; i < lines.length; i++) { const len = lines[i].length; if (caret <= acc + len) { cl = i; cc = caret - acc; break } acc += len + 1 }
    if (!re.test(lines[cl])) return { text: full, caret }
    let top = cl; while (top > 0 && re.test(lines[top - 1])) top--
    let bot = cl; while (bot < lines.length - 1 && re.test(lines[bot + 1])) bot++
    let n = parseInt(lines[top].match(re)![1], 10); let shift = 0
    for (let i = top; i <= bot; i++) {
      const old = lines[i].match(re)![0]; const nm = `${n}${delim} `
      lines[i] = nm + lines[i].slice(old.length)
      const diff = nm.length - old.length
      if (diff && (i < cl || (i === cl && cc >= old.length))) shift += diff
      n++
    }
    return { text: lines.join('\n'), caret: caret + shift }
  }
  // Enter inside a list: continue the marker (number +1 & renumber, or repeat the bullet);
  // an empty item exits the list.
  function listEnter(): boolean {
    const ta = taRef.current; if (!ta) return false
    const pos = ta.selectionStart; if (pos !== ta.selectionEnd) return false
    const ls = text.lastIndexOf('\n', pos - 1) + 1
    const nl = text.indexOf('\n', pos); const le = nl === -1 ? text.length : nl
    const line = text.slice(ls, le)
    const dm = line.trim().match(/^([-=])\1{2,4}$/) // 3–5 of - or = + Enter → a 50-char divider (a longer line is left alone, so Enter works normally on the divider itself)
    if (autoConv.symbol && dm) {
      const divider = dm[1].repeat(50)
      applyText(text.slice(0, ls) + divider + '\n' + text.slice(le), ls + divider.length + 1); return true
    }
    if (!autoConv.bullet) return false
    const num = line.match(NUM_MARK); const sym = line.match(SYM_MARK)
    if (!num && !sym) return false
    const marker = (num ?? sym)![0]
    if (line.slice(marker.length).trim() === '') { applyText(text.slice(0, ls) + text.slice(le), ls); return true }
    if (num) {
      const delim = num[2]; const nextM = `${parseInt(num[1], 10) + 1}${delim} `
      let nt = text.slice(0, pos) + '\n' + nextM + text.slice(pos); let caret = pos + 1 + nextM.length
      ;({ text: nt, caret } = renumberAt(nt, caret, delim)); applyText(nt, caret); return true
    }
    // symbol: turn the trigger (* o @) into its glyph on this line, then continue with the glyph
    const glyph = SYM_TO_GLYPH[sym![1]]
    let nt = text.slice(0, ls) + glyph + text.slice(ls + 1)
    nt = nt.slice(0, pos) + '\n' + glyph + ' ' + nt.slice(pos)
    applyText(nt, pos + glyph.length + 2); return true
  }
  // Apply a bullet/number from the toolbar. With a drag selection it marks EVERY selected
  // line (numbered 1,2,3… or symbol), keeping the block selected; with no selection it marks
  // the current line (numbered then merges/renumbers with an adjacent numbered block).
  const STRIP_MARK = /^(?:[*o@\-▶●○■] |\d+[.)>] )/
  function applyBullet(kind: 'sym' | 'num') {
    const ta = taRef.current; if (!ta) return
    // A textarea keeps its selectionStart/End even after the toolbar steals focus, so the
    // drag range is still here when this runs.
    const s = ta.selectionStart, e = ta.selectionEnd
    const blockStart = text.lastIndexOf('\n', s - 1) + 1
    let endIdx = e
    if (endIdx > s && text[endIdx - 1] === '\n') endIdx-- // selection ending exactly on a break shouldn't grab the next line
    const nl = text.indexOf('\n', endIdx); const blockEnd = nl === -1 ? text.length : nl
    const lines = text.slice(blockStart, blockEnd).split('\n')

    if (lines.length > 1) {
      let n = 1
      const block = lines.map((ln) => {
        const st = ln.replace(STRIP_MARK, '')
        if (st.trim() === '') return st // leave blank lines alone (and don't number them)
        return (kind === 'sym' ? '● ' : `${n++}. `) + st
      }).join('\n')
      const nt = text.slice(0, blockStart) + block + text.slice(blockEnd)
      applyText(nt, blockStart, blockStart + block.length) // keep the whole block selected
      return
    }

    const stripped = lines[0].replace(STRIP_MARK, '')
    const marker = kind === 'sym' ? '● ' : '1. '
    let nt = text.slice(0, blockStart) + marker + stripped + text.slice(blockEnd)
    let caret = blockStart + marker.length + stripped.length
    if (kind === 'num') ({ text: nt, caret } = renumberAt(nt, caret, '.'))
    applyText(nt, caret)
  }
  // After a delete, re-sequence the numbered block at the caret (auto-decrement).
  function renumberAfterDelete() {
    const ta = taRef.current; if (!ta) return
    const caret = ta.selectionStart; const full = ta.value
    const ls = full.lastIndexOf('\n', caret - 1) + 1
    const m = full.slice(ls).match(/^\d+([.)>]) /)
    if (!m) return
    const { text: nt, caret: nc } = renumberAt(full, caret, m[1])
    if (nt !== full) applyText(nt, nc)
  }

  // Typing SPACE after a trigger converts it in place: -> → →, <- → ←, and a bare URL → a
  // [url](href) markdown link. Gated by the auto-convert toggles.
  function spaceConvert(): boolean {
    const ta = taRef.current; if (!ta) return false
    const pos = ta.selectionStart; if (pos !== ta.selectionEnd) return false
    const val = ta.value // read the live DOM value (React state can lag one keystroke)
    const before = val.slice(0, pos)
    if (autoConv.symbol) {
      if (before.endsWith('->')) { applyText(val.slice(0, pos - 2) + '→ ' + val.slice(pos), pos); return true }
      if (before.endsWith('<-')) { applyText(val.slice(0, pos - 2) + '← ' + val.slice(pos), pos); return true }
    }
    if (autoConv.link) {
      // Match http(s)://… / www.… OR a bare domain.tld (TLD whitelist avoids linkifying "3.14",
      // "file.txt", "e.g.", etc.). The link ends at the caret (a space is about to be typed).
      const TLD = 'com|net|org|io|dev|app|ai|co|kr|jp|cn|us|uk|de|fr|it|es|ru|nl|se|no|pl|tr|br|in|au|ca|me|tv|info|biz|xyz|gg|edu|gov|shop|store|site|online|blog'
      const seg = before.match(/(?:https?:\/\/|www\.)[^\s()[\]<>]+$/i)?.[0]
        ?? before.match(new RegExp(`(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${TLD})(?:/[^\\s()[\\]<>]*)?$`, 'i'))?.[0]
      if (seg && !before.slice(0, before.length - seg.length).endsWith('](')) { // not already inside a markdown link
        const href = /^https?:\/\//i.test(seg) ? seg : 'https://' + seg
        const md = `[${seg}](${href})`; const start = pos - seg.length
        applyText(val.slice(0, start) + md + ' ' + val.slice(pos), start + md.length + 1); return true
      }
    }
    return false
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey; const k = e.key.toLowerCase()
    if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    else if (mod && k === 'f') { e.preventDefault(); setShowFind(true); setShowChars(false); setShowSettings(false) }
    else if (!mod && !e.nativeEvent.isComposing && e.key === 'Enter' && !e.shiftKey) { if (listEnter()) e.preventDefault() }
    else if (!mod && !e.nativeEvent.isComposing && e.key === ' ') { if (spaceConvert()) e.preventDefault() }
    else if (!mod && !e.nativeEvent.isComposing && (e.key === 'Backspace' || e.key === 'Delete')) { requestAnimationFrame(renumberAfterDelete) }
  }

  // Tabs
  function addDoc() {
    const src = docs.find((d) => d.id === activeId) ?? docs[0]
    // A new tab inherits the current tab's font / size / line-spacing.
    const d: Doc = { id: uid(), name: uniqueName(docs), text: '', fam: src?.fam ?? DEFAULTS.fam, size: src?.size ?? DEFAULTS.size, lh: src?.lh ?? DEFAULTS.lh, updatedAt: Date.now(), createdAt: Date.now() }
    histories.current[d.id] = { hist: [''], idx: 0 }
    setDocs((ds) => [...ds, d]); setActiveId(d.id); setRenaming(d.id) // open straight into name-edit mode
  }
  function closeDoc(id: string) {
    const doc = docs.find((x) => x.id === id)
    if (doc && doc.text.trim() && !window.confirm(t('np_close_confirm'))) return // only ask when there's content to lose
    deletedRef.current = { ...deletedRef.current, [id]: Date.now() } // tombstone so other tabs don't resurrect it
    delete histories.current[id]
    const rest = docs.filter((x) => x.id !== id)
    if (rest.length === 0) {
      const nd: Doc = { id: uid(), name: uniqueName([]), text: '', ...DEFAULTS, updatedAt: Date.now(), createdAt: Date.now() }
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

  // On mobile, snap the editor box to just under the header on focus (the keyboard's
  // native scroll otherwise overshoots past it). Desktop scrolls immediately.
  function scrollBoxTop() {
    // Scroll the tool card to just under the sticky header (its scroll-mt-16). Instant — a
    // smooth scroll gets cancelled by the keyboard. A single fixed-delay scroll is what
    // reliably lands on the card's top line: scrolling only AFTER the keyboard has fully
    // settled (visualViewport) overshoots upward, so we deliberately fire mid-open instead.
    const el = wrapRef.current?.closest('.bg-white.rounded-2xl') as HTMLElement | null; if (!el) return
    const go = () => el.scrollIntoView({ block: 'start' })
    // Touch devices pop a keyboard and need to wait for it (detect by touch, not width, so the
    // wide-screen Fold counts too). A wide touch screen (unfolded Fold) animates its keyboard
    // slower than a phone, so it gets a longer wait. Mouse devices scroll immediately.
    const touch = (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || !!window.matchMedia?.('(pointer: coarse)').matches
    const delay = !touch ? 60 : window.innerWidth >= 640 ? 500 : 350
    setTimeout(go, delay)
  }
  // Attach focus-scroll as a NATIVE listener — it fires reliably for every focus
  // (incl. real taps/clicks), unlike React's onFocus which proved flaky here.
  useEffect(() => {
    const ta = taRef.current; if (!ta) return
    const h = () => scrollBoxTop()
    ta.addEventListener('focus', h)
    return () => ta.removeEventListener('focus', h)
  }, [])
  // Mobile keyboard: shrink the editor to exactly fit the area between the toolbar and the
  // on-screen keyboard. Then pressing Enter scrolls the textarea INTERNALLY instead of jolting
  // the whole page on every keystroke. Recompute only on viewport resize (keyboard open/close)
  // — never on scroll — so typing never triggers a height change (no jitter).
  useEffect(() => {
    const vv = window.visualViewport
    const ta = taRef.current
    if (!vv || !ta) return
    let timer: ReturnType<typeof setTimeout>
    const apply = () => {
      const kbOpen = window.innerHeight - vv.height > 120 // soft keyboard is up
      if (!kbOpen) { ta.style.height = ''; return }       // restore the CSS height
      const top = ta.getBoundingClientRect().top - vv.offsetTop // textarea top within the visible area
      const avail = vv.height - top - 12
      if (avail > 120) ta.style.height = avail + 'px'
    }
    const onResize = () => { clearTimeout(timer); timer = setTimeout(apply, 200) } // let keyboard + focus-scroll settle
    vv.addEventListener('resize', onResize)
    return () => { vv.removeEventListener('resize', onResize); clearTimeout(timer); ta.style.height = '' }
  }, [])
  // Keep the active tab visible & symmetric: a latter-half tab scrolls the bar to its
  // right end (so the "+ new tab" button shows); a first-half tab scrolls to the left
  // end (so the leading tabs show).
  useEffect(() => {
    const bar = tabBarRef.current; if (!bar) return
    const idx = docs.findIndex((d) => d.id === activeId); if (idx < 0) return
    bar.scrollTo({ left: idx >= docs.length / 2 ? bar.scrollWidth : 0, behavior: 'smooth' })
  }, [activeId, docs.length])

  // Find / replace within the active tab (literal, case-sensitive).
  function findNext(fromStart = false) {
    const ta = taRef.current; if (!ta || !findQ) return
    let idx = text.indexOf(findQ, fromStart ? 0 : (ta.selectionEnd || 0))
    if (idx < 0) idx = text.indexOf(findQ, 0) // wrap around
    if (idx < 0) { setMatchInfo(t('np_no_match')); return }
    ta.focus(); ta.setSelectionRange(idx, idx + findQ.length)
    setMatchInfo(t('np_matches', { n: text.split(findQ).length - 1 }))
  }
  function replaceOne() {
    const ta = taRef.current; if (!ta || !findQ) return
    if (text.slice(ta.selectionStart, ta.selectionEnd) === findQ) {
      const at = ta.selectionStart
      onChange(text.slice(0, at) + replaceQ + text.slice(ta.selectionEnd))
      requestAnimationFrame(() => { const t2 = taRef.current; if (t2) { t2.focus(); t2.setSelectionRange(at + replaceQ.length, at + replaceQ.length) } })
    } else findNext()
  }
  function replaceAll() {
    if (!findQ) return
    const total = text.split(findQ).length - 1
    if (!total) { setMatchInfo(t('np_no_match')); return }
    onChange(text.split(findQ).join(replaceQ))
    setMatchInfo(t('np_replaced', { n: total }))
  }

  // Download every tab as its own .txt inside a single zip (login-gated like TXT).
  async function zipDownload() {
    // TEMP: login gate disabled — ZIP download allowed for everyone while sign-in is unavailable.
    // if (user === 'loading') return
    // if (!user) { router.push(loginHref(params.lang, `/${params.lang}/tools/online-notepad`)); return }
    const { zipSync, strToU8 } = await import('fflate')
    const data: Record<string, Uint8Array> = {}
    for (const d of docs) {
      const base = (((d.name || 'notes').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)) || 'notes') + `_${fmtDateFile(d.createdAt)}`
      let name = `${base}.txt`; let i = 2
      while (data[name]) name = `${base}_${i++}.txt`
      data[name] = strToU8(d.text || '')
    }
    const blob = new Blob([zipSync(data, { level: 6 })], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'notepad.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  function download() {
    // TEMP: login gate disabled — TXT download allowed for everyone while sign-in is unavailable.
    // if (user === 'loading') return
    // if (!user) { router.push(loginHref(params.lang, `/${params.lang}/tools/online-notepad`)); return }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(active?.name || 'notes').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)}_${fmtDateFile(active.createdAt)}.txt`
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
  const selCls = 'rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 min-w-0 flex-1 sm:flex-none'
  // Icon hints matching each setting's nature: a sample glyph (typeface),
  // ↕ (size), ≡ (line spacing).
  const fontIcon = ({ ko: '가', ja: 'あ', en: 'A' } as Record<string, string>)[params.lang] || 'A'
  const ico = (g: string) => <span className="inline-flex w-4 justify-center text-gray-500 text-[13px] font-bold leading-none">{g}</span>

  // Format controls (font / size / line-height / bullets) — all custom dropdowns. Rendered
  // once here and placed inline on desktop / full-width below the bar on mobile.
  const settingsControls = (
    <>
      <MenuSelect id="font" open={openMenu} setOpen={setOpenMenu} selCls={selCls} icon={ico(fontIcon)}
        label={t('np_font_' + (fontList.includes(fam) ? fam : 'sans'))}
        options={fontList.map((v) => ({ value: v, label: <span style={{ fontFamily: ALLFONTS[v]?.css }}>{t('np_font_' + v)}</span> }))}
        value={fontList.includes(fam) ? fam : 'sans'} onPick={(v) => patchDoc(activeId, { fam: v })} />
      <MenuSelect id="size" open={openMenu} setOpen={setOpenMenu} selCls={selCls} icon={ico('↕')}
        label={t('np_' + size)} options={(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((v) => ({ value: v, label: <span className={SIZE_CLS[v]}>{t('np_' + v)}</span> }))}
        value={size} onPick={(v) => patchDoc(activeId, { size: v as SizeLvl })} />
      <MenuSelect id="lh" open={openMenu} setOpen={setOpenMenu} selCls={selCls} icon={ico('≡')}
        label={t('np_' + lh)}
        options={(['sm', 'md', 'lg'] as const).map((v) => ({ value: v, label: (
          <span className="flex items-center gap-2">
            <span className="inline-flex flex-col w-3.5 shrink-0" style={{ gap: v === 'sm' ? '1px' : v === 'md' ? '3px' : '5px' }}><span className="h-px bg-gray-400" /><span className="h-px bg-gray-400" /><span className="h-px bg-gray-400" /></span>
            {t('np_' + v)}
          </span>
        ) }))}
        value={lh} onPick={(v) => patchDoc(activeId, { lh: v as Lvl })} />
      {/* List bullet — custom dropdown (leading marker 1./● + dimmed example markers) */}
      <div className="relative flex-1 min-w-0 sm:flex-none" title={t('np_list')}>
        {openMenu === 'list' && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
        <button type="button" onClick={() => setOpenMenu(openMenu === 'list' ? null : 'list')} aria-label={t('np_list')} className={selCls + ' relative z-20 flex items-center gap-1 w-full'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true">
            <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4.5" cy="6" r="1.2" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="4.5" cy="18" r="1.2" />
          </svg>
          <span className="truncate flex-1 text-left">{t('np_list')}</span>
          <span className="shrink-0 text-gray-400 text-[9px]">▾</span>
        </button>
        {openMenu === 'list' && (
          <div className="absolute z-30 mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-xs whitespace-nowrap">
            <button type="button" onClick={() => { applyBullet('num'); setOpenMenu(null) }} className="flex items-center gap-3 w-full px-3 py-1.5 hover:bg-gray-50 text-left">
              <span className="text-gray-700">1. {t('np_list_num')}</span><span className="text-gray-300 ml-auto">1. 1) 1&gt;</span>
            </button>
            <button type="button" onClick={() => { applyBullet('sym'); setOpenMenu(null) }} className="flex items-center gap-3 w-full px-3 py-1.5 hover:bg-gray-50 text-left">
              <span className="text-gray-700">● {t('np_list_sym')}</span><span className="text-gray-300 ml-auto">* @ o</span>
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={wrapRef} className="space-y-3 scroll-mt-20">
        {/* Tabs — one document per tab (auto-named by date).
            overflow-y-hidden stops the phantom 1px vertical scrollbar that
            overflow-x-auto otherwise spawns (its up/down arrows). */}
        <div ref={tabBarRef} className="flex items-stretch gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
          {docs.map((d) => {
            const on = d.id === activeId
            return (
              <div key={d.id} data-tab={d.id} onClick={() => setActiveId(d.id)} onDoubleClick={() => setRenaming(d.id)}
                className={'group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-sm cursor-pointer border border-b-0 -mb-px whitespace-nowrap ' +
                  (on ? 'bg-white border-gray-200 text-brand-700 font-semibold' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100')}>
                {renaming === d.id ? (
                  <input autoFocus defaultValue={d.name}
                    ref={(el) => { if (el && renaming === d.id) requestAnimationFrame(() => el.select()) }}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => { renameDoc(d.id, e.target.value.trim()); setRenaming(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { renameDoc(d.id, (e.target as HTMLInputElement).value.trim()); setRenaming(null) } if (e.key === 'Escape') setRenaming(null) }}
                    className="w-24 px-1 text-sm border border-brand-300 rounded outline-none" />
                ) : (
                  <span className="max-w-[10rem] truncate">{d.name}</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); closeDoc(d.id) }} aria-label={t('np_closetab')}
                  className={'hover:text-red-500 text-base leading-none ' + (d.text.trim() ? (on ? 'text-gray-400' : 'hidden') : 'text-red-300')}>×</button>
              </div>
            )
          })}
          <button onClick={addDoc} title={t('np_newtab')} aria-label={t('np_newtab')}
            className="shrink-0 px-2.5 py-1.5 text-gray-400 hover:text-brand-600 text-lg leading-none">+</button>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap sm:flex-nowrap min-w-0">
            <div className="flex items-center gap-0.5">
              <button onClick={undo} disabled={!canUndo} title={t('np_undo')} aria-label={t('np_undo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg>
              </button>
              <button onClick={redo} disabled={!canRedo} title={t('np_redo')} aria-label={t('np_redo')} className={iconBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg>
              </button>
              <button onClick={() => { setShowFind((s) => !s); setShowChars(false); setShowSettings(false) }} title={t('np_findreplace')} aria-label={t('np_findreplace')} aria-pressed={showFind} className={iconBtn + (showFind ? ' bg-brand-50 text-brand-600' : '')}>
                <ToolIcon name="search" className="w-4 h-4" />
              </button>
              <button onClick={() => { setShowChars((s) => !s); setShowFind(false); setShowSettings(false) }} title={t('np_symbols')} aria-label={t('np_symbols')} aria-pressed={showChars} className={iconBtn + (showChars ? ' bg-brand-50 text-brand-600' : '')}>
                <span className="block w-4 h-4 text-base leading-4 text-center">※</span>
              </button>
              {/* Auto-convert toggles — custom dropdown with checkboxes */}
              <div className="relative">
                {openMenu === 'auto' && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
                <button type="button" onClick={() => setOpenMenu(openMenu === 'auto' ? null : 'auto')} title={t('np_autoconvert')} aria-label={t('np_autoconvert')} aria-pressed={openMenu === 'auto'} className={'relative z-20 ' + iconBtn + (openMenu === 'auto' ? ' bg-brand-50 text-brand-600' : '')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m14 4 1.2 2.8L18 8l-2.8 1.2L14 12l-1.2-2.8L10 8l2.8-1.2L14 4Z" /><path d="M5 19 13 11" /><path d="M19 15v4M17 17h4" /></svg>
                </button>
                {openMenu === 'auto' && (
                  <div className="absolute z-30 mt-1 left-0 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 text-sm">
                    <p className="px-3 py-1 text-xs font-medium text-gray-400">{t('np_autoconvert')}</p>
                    {([
                      ['symbol', t('np_ac_symbol'), '--- === -> <-'],
                      ['link', t('np_ac_link'), 'www.a.com → [ ]( )'],
                      ['bullet', t('np_ac_bullet'), '1. 1> * @'],
                    ] as const).map(([key, label, hint]) => (
                      <label key={key} className="flex items-start gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={autoConv[key]} onChange={(e) => setAutoConv((p) => ({ ...p, [key]: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-brand-600 shrink-0" />
                        <span className="min-w-0">
                          <span className="text-gray-700">{label}</span>
                          <span className="block text-[11px] text-gray-400 font-mono truncate">{hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Edit ↔ preview: preview renders links as clickable anchors */}
              <button type="button" onClick={() => setPreview((p) => !p)} title={preview ? t('np_edit') : t('np_preview')} aria-label={preview ? t('np_edit') : t('np_preview')} aria-pressed={preview} className={iconBtn + (preview ? ' bg-brand-50 text-brand-600' : '')}>
                {preview
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>}
              </button>
            </div>
            <span className="w-px h-5 bg-gray-200" />
            {/* Mobile-only gear: the display settings are hidden until tapped. */}
            <button onClick={() => { setShowSettings((s) => !s); setShowFind(false); setShowChars(false) }} title={t('np_settings')} aria-label={t('np_settings')} aria-pressed={showSettings} className={'sm:hidden ' + iconBtn + (showSettings ? ' bg-brand-50 text-brand-600' : '')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" /><line x1="17" x2="23" y1="16" y2="16" /></svg>
            </button>
            {/* Display settings — inline on desktop; on mobile they move to a full-width row
                below the bar (so the save-time on the right doesn't squeeze them). */}
            <div className="hidden sm:flex items-center gap-x-2.5 gap-y-1.5 flex-wrap text-xs text-gray-500">{settingsControls}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0 min-h-7">
            {/* Show the save status only when the tab has content; "saving…" auto-hides after 3s. */}
            {text && (savedAt || savingVisible) && (
              <span className={'text-xs font-medium transition-colors ' + (savedAt ? 'text-green-600' : 'text-gray-400')}>
                {savedAt ? <><span className="hidden sm:inline">{`✓ ${t('np_autosaved')} `}</span>{savedAt}</> : t('np_saving')}
              </span>
            )}
          </div>
        </div>

        {/* Mobile display settings — full-width row below the bar (uses the whole width). */}
        {showSettings && <div className="sm:hidden flex items-center gap-2 flex-wrap text-xs text-gray-500">{settingsControls}</div>}

        {showFind && (
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
            <input value={findQ} onChange={(e) => setFindQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') findNext(); if (e.key === 'Escape') setShowFind(false) }}
              placeholder={t('np_find')} autoFocus className="min-w-0 flex-1 sm:flex-none sm:w-40 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input value={replaceQ} onChange={(e) => setReplaceQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') replaceOne(); if (e.key === 'Escape') setShowFind(false) }}
              placeholder={t('np_replace')} className="min-w-0 flex-1 sm:flex-none sm:w-40 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={() => findNext()} disabled={!findQ} className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40"><span className="sm:hidden">{t('np_find_short')}</span><span className="hidden sm:inline">{t('np_find_next')}</span></button>
            <button onClick={replaceOne} disabled={!findQ} className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40">{t('np_replace_btn')}</button>
            <button onClick={replaceAll} disabled={!findQ} className="px-2.5 py-1.5 text-xs rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40"><span className="sm:hidden">{t('np_all_short')}</span><span className="hidden sm:inline">{t('np_replace_all')}</span></button>
            {matchInfo && <span className="text-xs text-gray-500">{matchInfo}</span>}
          </div>
        )}

        {showChars && (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-2">
            <div className="flex items-center justify-between px-1 pb-1.5">
              <span className="text-xs text-gray-500">{t('np_symbols')}</span>
              <button onClick={() => setShowChars(false)} aria-label={t('ui_clear')} className="inline-flex items-center justify-center text-gray-400 hover:text-gray-700 px-1"><ToolIcon name="x" className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-0.5 max-h-44 overflow-y-auto">
              {CHARS.map((c) => (
                <button key={c} onClick={() => insertChar(c)} title={c}
                  className="w-8 h-8 shrink-0 rounded-md text-base text-gray-700 hover:bg-brand-100 hover:text-brand-700 transition-colors">{c}</button>
              ))}
            </div>
          </div>
        )}

        {preview ? (
          <div
            style={{ fontFamily: FAM_CSS(fam) }}
            className={`w-full h-[56vh] min-h-72 p-4 border border-gray-200 rounded-xl text-gray-800 overflow-auto whitespace-pre-wrap break-words ${SIZE_CLS[size]} ${LH_CLS[lh]}`}
            // Read-only rendered view — links become clickable anchors. renderPreview escapes the
            // text first (XSS-safe). Toggle back to editing with the toolbar button.
            dangerouslySetInnerHTML={{ __html: renderPreview(text) || `<span class="text-gray-400">${t('np_placeholder')}</span>` }}
          />
        ) : (
          <textarea
            ref={taRef}
            data-no-autoselect
            data-no-scroll-focus
            value={text}
            onInput={(e) => { liveRef.current = e.currentTarget.value }}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => { composingRef.current = true }}
            onCompositionEnd={() => { composingRef.current = false; flushNow() }}
            // Clicking/tapping into the editor closes the symbol palette. PointerDown (not
            // focus) so inserting a symbol — which programmatically refocuses — keeps it open.
            onPointerDown={() => { if (showChars) setShowChars(false) }}
            placeholder={t('np_placeholder')}
            spellCheck={false}
            style={{ fontFamily: FAM_CSS(fam) }}
            className={`w-full h-[56vh] min-h-72 p-4 border border-gray-200 rounded-xl text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 ${SIZE_CLS[size]} ${LH_CLS[lh]}`}
          />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={download} disabled={!text} aria-label={t('np_download')} title={t('np_download')}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ToolIcon name="download" className="w-4 h-4" /><span className="sm:hidden">.txt</span><span className="hidden sm:inline">{t('np_download')}</span>
          </button>
          <button onClick={zipDownload} disabled={docs.every((d) => !d.text)} aria-label={t('np_zip')} title={t('np_zip')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ToolIcon name="archive" className="w-4 h-4" /><span className="sm:hidden">ZIP</span><span className="hidden sm:inline">{t('np_zip')}</span>
          </button>
          <button onClick={copy} disabled={!text}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {copied ? <><ToolIcon name="check" className="w-4 h-4" />{t('np_copied')}</> : <><ToolIcon name="copy" className="w-4 h-4" />{t('ui_copy')}</>}
          </button>
          {/* char/line counts + creation date — icon + number only, just left of Clear */}
          <span className="ml-auto flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-gray-400 tabular-nums">
            <span className="inline-flex items-center gap-1" title={t('np_chars_label')}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
              {chars.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1" title={t('np_lines_label')}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line x1="17" x2="3" y1="18" y2="18" /></svg>
              {lines.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1" title={t('np_created')}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
              {fmtDate(active.createdAt)}
            </span>
          </span>
          <button onClick={clear} disabled={!text}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
            {t('ui_clear')}
          </button>
        </div>

        {/* Privacy banner — unified with the other tools */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('np_note')}</span>
        </div>
      </div>
    </ToolLayout>
  )
}
