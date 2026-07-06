'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'
import { mhList, mhPutMeta, mhPutManyMeta, mhSave, mhSetBlob, mhDelete, mhClear, mhAutoSave, mhAutoSaveMany, mhDropBlobs, mhStorageUsage } from '@/lib/tools/musicHistory'
import { readId3 } from '@/lib/tools/id3'

const tool = getToolBySlug('music-player')!
const AUDIO_RE = /\.(mp3|m4a|aac|flac|ogg|oga|wav|opus|weba|wma|3gp|amr|mid)$/i
const isAudio = (f: File) => /^audio\//.test(f.type) || AUDIO_RE.test(f.name)
// Android folder picks often give a blank MIME type + no extension, so a strict audio test drops
// everything. For folders/drops we instead accept anything that ISN'T clearly non-audio.
const NOT_AUDIO_RE = /\.(jpe?g|png|gif|webp|heic|heif|bmp|svg|tiff?|ico|mp4|m4v|mov|mkv|avi|webm|flv|wmv|mpe?g|txt|md|pdf|zip|rar|7z|docx?|xlsx?|pptx?|apk|exe|html?|csv|json|xml)$/i
const maybeAudio = (f: File) => isAudio(f) || (!/^(image|video|text)\//.test(f.type) && !NOT_AUDIO_RE.test(f.name))
const fmt = (s: number) => { if (!isFinite(s) || s < 0) s = 0; const m = Math.floor(s / 60); const ss = Math.floor(s % 60); return `${m}:${String(ss).padStart(2, '0')}` }
const fmtSize = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB')
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const VOLUMES = [0, 0.25, 0.5, 0.75, 1]
const TIMER_MENU = [15, 30, 60, 120]

export default function MusicPlayerPage({ params: { lang } }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [url, setUrl] = useState('')
  const [base, setBase] = useState('')
  const [dur, setDur] = useState(0)
  const [cur, setCur] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all' | 'shuffle'>('all')
  const [sleepMin, setSleepMin] = useState(0)
  const [sleepLeft, setSleepLeft] = useState(0)
  const [history, setHistory] = useState<{ name: string; size: number; file: File | null }[]>([])
  const [curFile, setCurFile] = useState<File | null>(null)
  const [histTab, setHistTab] = useState<'all' | 'saved'>('all')
  const [saved, setSaved] = useState<Set<string>>(() => new Set())
  const [notice, setNotice] = useState<{ msg: string; err?: boolean } | null>(null) // on-screen diagnostic (surface real errors)
  const [panel, setPanel] = useState<'none' | 'vol' | 'speed' | 'timer'>('none') // which bottom gauge is open
  const [showSettings, setShowSettings] = useState(false) // settings options modal
  const [eqEnabled, setEqEnabled] = useState(false) // show an equalizer (instead of the note) while playing
  const [darkMode, setDarkMode] = useState(false) // dark player theme (default off)
  const [albumArt, setAlbumArt] = useState(true) // fetch cover art by title (default on)
  const [artUrl, setArtUrl] = useState('') // iTunes cover-art URL (fallback)
  const [itTitle, setItTitle] = useState('') // iTunes title (fallback)
  const [itArtist, setItArtist] = useState('') // iTunes artist (fallback)
  const [id3, setId3] = useState<{ title?: string; artist?: string; cover?: string } | null>(null) // local ID3v2 tags
  const [navHi, setNavHi] = useState<'prev' | 'next' | null>(null) // prev/next momentary highlight
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [autoSave, setAutoSave] = useState(true) // cache added/played tracks so the list replays after refresh (default on)
  const autoSaveRef = useRef(true)
  useEffect(() => { autoSaveRef.current = autoSave }, [autoSave])
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(null) // storage readout for settings
  const [lyricsOn, setLyricsOn] = useState(true) // look up lyrics for the current track (default on)
  const [lyrics, setLyrics] = useState<string | null>(null) // resolved lyrics text
  const [toast, setToast] = useState('') // transient message (e.g. sleep-timer stopped)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [searchOn, setSearchOn] = useState(false) // playlist search box open
  const [query, setQuery] = useState('') // playlist search text
  const [durs, setDurs] = useState<Record<string, number>>({}) // per-track duration cache (key → seconds)
  const [renderN, setRenderN] = useState(80) // rows actually rendered (grows on scroll → big folders never freeze the UI)
  const onListScroll = (e: React.UIEvent<HTMLDivElement>) => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) setRenderN((n) => n + 80) }
  useEffect(() => {
    try {
      setEqEnabled(localStorage.getItem('mp_eq_v1') === '1')
      setDarkMode(localStorage.getItem('mp_dark_v1') === '1')
      setAlbumArt(localStorage.getItem('mp_art_v1') !== '0') // default on
      setLyricsOn(localStorage.getItem('mp_lyrics_v1') !== '0') // default on
      setAutoSave(localStorage.getItem('mp_autosave_v1') !== '0') // default on
    } catch { /* ignore */ }
  }, [])
  const toggleAutoSave = () => setAutoSave((v) => { const n = !v; try { localStorage.setItem('mp_autosave_v1', n ? '1' : '0') } catch { /* ignore */ } return n })
  const toggleEq = () => setEqEnabled((v) => { const n = !v; try { localStorage.setItem('mp_eq_v1', n ? '1' : '0') } catch { /* ignore */ } return n })
  const toggleDark = () => setDarkMode((v) => { const n = !v; try { localStorage.setItem('mp_dark_v1', n ? '1' : '0') } catch { /* ignore */ } return n })
  const toggleArt = () => setAlbumArt((v) => { const n = !v; try { localStorage.setItem('mp_art_v1', n ? '1' : '0') } catch { /* ignore */ } return n })
  const toggleLyrics = () => setLyricsOn((v) => { const n = !v; try { localStorage.setItem('mp_lyrics_v1', n ? '1' : '0') } catch { /* ignore */ } return n })
  const flashNav = (dir: 'prev' | 'next') => { setNavHi(dir); if (navTimer.current) clearTimeout(navTimer.current); navTimer.current = setTimeout(() => setNavHi(null), 3000) }
  const showToast = (msg: string) => { setToast(msg); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4500) }
  useEffect(() => { if (showSettings) mhStorageUsage().then(setUsage) }, [showSettings])
  useEffect(() => { setRenderN(80) }, [histTab, query]) // restart the render window when the tab/search changes
  // ---- Metadata: 1) local ID3v2 tags (primary), 2) iTunes (fallback), 3) filename ----
  // Primary/local: read the current file's embedded ID3 tags (title/artist + cover). No network.
  useEffect(() => {
    let alive = true; let coverUrl = ''
    setId3(null)
    if (curFile) readId3(curFile).then((m) => {
      if (!alive) return
      if (m.cover) coverUrl = URL.createObjectURL(m.cover)
      setId3({ title: m.title, artist: m.artist, cover: coverUrl })
    }).catch(() => { /* ignore */ })
    return () => { alive = false; if (coverUrl) URL.revokeObjectURL(coverUrl) }
  }, [curFile])
  // Fallback/network: only when album art is on AND the file has no embedded cover — sends title text.
  useEffect(() => {
    setArtUrl(''); setItTitle(''); setItArtist('')
    if (!albumArt || !base || id3?.cover) return
    let alive = true
    const q = base.replace(/[_-]+/g, ' ').replace(/\b(official|audio|lyrics?|mv|hd|4k)\b/gi, '').replace(/\s+/g, ' ').trim().slice(0, 60)
    if (!q) return
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1`)
      .then((r) => r.json())
      .then((d) => { if (!alive) return; const r = d?.results?.[0]; if (!r) return; if (r.artworkUrl100) setArtUrl(String(r.artworkUrl100).replace('100x100', '600x600')); setItTitle(r.trackName || ''); setItArtist(r.artistName || '') })
      .catch(() => { /* ignore */ })
    return () => { alive = false }
  }, [base, albumArt, id3])
  // Lyrics: prefer ID3 artist/title, else split "Artist - Title". lrclib.net returns TIME-SYNCED
  // lyrics (LRC) when available (→ highlight the current line) and plain lyrics otherwise.
  useEffect(() => {
    setLyrics(null); setLyricsLines(null)
    if (!lyricsOn) return
    let artist = (id3?.artist || '').trim(), title = (id3?.title || '').trim()
    if (!artist || !title) {
      const m = (base || '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+[-–—]\s+/)
      if (m.length >= 2) { artist = m[0].trim(); title = m.slice(1).join(' - ').replace(/\b(official|audio|lyrics?|mv|hd|4k)\b/gi, '').trim() }
    }
    if (!artist || !title) return
    let alive = true
    const apply = (d: { syncedLyrics?: string; plainLyrics?: string } | null | undefined): boolean => {
      if (!alive || !d) return false
      if (d.syncedLyrics) {
        const lines: { t: number; text: string }[] = []
        const re = /\[(\d+):(\d+(?:\.\d+)?)\]/g
        for (const ln of String(d.syncedLyrics).split('\n')) {
          const times: number[] = []; let tg: RegExpExecArray | null
          re.lastIndex = 0
          while ((tg = re.exec(ln)) !== null) times.push(parseInt(tg[1]) * 60 + parseFloat(tg[2]))
          if (!times.length) continue
          const text = ln.replace(/\[[^\]]*\]/g, '').trim()
          for (const tt of times) lines.push({ t: tt, text })
        }
        if (lines.length) { setLyricsLines(lines.sort((a, b) => a.t - b.t)); return true }
      }
      if (d.plainLyrics) { setLyrics(String(d.plainLyrics).trim()); return true }
      return false
    }
    // 1) exact lrclib /get, then 2) fuzzy /search fallback (helps CJK titles the exact match misses).
    fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}` + (dur > 1 ? `&duration=${Math.round(dur)}` : ''))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (apply(d)) return
        return fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((arr: { syncedLyrics?: string; plainLyrics?: string }[] | null) => { if (alive && Array.isArray(arr) && arr.length) apply(arr.find((x) => x.syncedLyrics) || arr.find((x) => x.plainLyrics) || arr[0]) })
      })
      .catch(() => { /* ignore */ })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, id3, lyricsOn, dur])
  const [reorder, setReorder] = useState(false) // playlist reorder mode (drag handle per row)
  const [dragKey, setDragKey] = useState<string | null>(null) // row currently being dragged
  // ---- groups (the 리스트/플레이리스트 tab) ----
  const [groups, setGroups] = useState<{ id: string; name: string; keys: string[] }[]>([]) // custom groups
  const [openGroup, setOpenGroup] = useState<string | null>(null) // null=group list · 'fav'=즐겨찾기 · else group id
  const [creating, setCreating] = useState(false) // inline "new group" input open
  const [newName, setNewName] = useState('')
  const [addMode, setAddMode] = useState(false) // group detail: pick songs to add/remove
  const [menuFor, setMenuFor] = useState<{ key: string; file: File | null; name: string } | null>(null) // long-press "add to group" popup
  const [menuCreating, setMenuCreating] = useState(false)
  const [menuNewName, setMenuNewName] = useState('')
  const [starMenu, setStarMenu] = useState(false) // ★ bottom-bar: add the current track to a playlist
  const [lyricsLines, setLyricsLines] = useState<{ t: number; text: string }[] | null>(null) // time-synced lyrics

  const audioRef = useRef<HTMLAudioElement>(null)
  // Web Audio graph for the real (audio-synced) equalizer — only built when the equalizer is enabled.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const audioCtxRef = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const eqSrcRef = useRef<any>(null)
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const eqRafRef = useRef<number>(0)
  const eqWrapRef = useRef<HTMLDivElement>(null)
  const eqReflRef = useRef<HTMLDivElement>(null) // faint reflection under the equalizer
  const lyricsBoxRef = useRef<HTMLDivElement>(null)
  const groupsRef = useRef(groups)
  useEffect(() => { groupsRef.current = groups }, [groups])
  const pressRef = useRef<ReturnType<typeof setTimeout> | null>(null) // long-press timer
  const pressStartRef = useRef(0) // when the current press began (to distinguish tap vs long-press on click)
  const dragKeyRef = useRef<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const groupListRef = useRef<HTMLDivElement>(null) // playlist song list — reorder container
  const cardRef = useRef<HTMLDivElement>(null) // now-playing card — scroll target on track click
  const playlistRef = useRef<HTMLDivElement>(null) // playlist card — scroll target for the list button
  const inputRef = useRef<HTMLInputElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)
  const positionsRef = useRef<Record<string, number>>({})
  const resumePosRef = useRef(0)
  const posSaveTsRef = useRef(0)
  const sleepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const savedRef = useRef<Set<string>>(new Set())
  const durLoadedRef = useRef<Set<string>>(new Set()) // tracks we've already probed for duration
  useEffect(() => { savedRef.current = saved }, [saved])

  // ---- persistence: resume positions + starred set + restored list ----
  useEffect(() => { try { const s = localStorage.getItem('mp_pos_v1'); if (s) positionsRef.current = JSON.parse(s) } catch { /* ignore */ } }, [])
  // Flush the resume position the moment the tab is hidden/closed, so a refresh mid-playback resumes.
  useEffect(() => {
    const flush = () => { try { const a = audioRef.current; if (a && curFile && a.currentTime > 0) positionsRef.current[curFile.name + '|' + curFile.size] = a.currentTime; localStorage.setItem('mp_pos_v1', JSON.stringify(positionsRef.current)) } catch { /* ignore */ } }
    const onVis = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', flush); document.addEventListener('visibilitychange', onVis)
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onVis) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curFile])
  // Probe each track's duration (once) via a throwaway audio element so the list can show its length.
  useEffect(() => {
    const need = history.filter((h) => h.file && !durLoadedRef.current.has(h.name + '|' + h.size)).slice(0, 60)
    if (!need.length) return
    let alive = true; let i = 0
    const el = document.createElement('audio'); el.preload = 'metadata'
    const next = () => {
      if (!alive || i >= need.length) return
      const h = need[i++]; const key = h.name + '|' + h.size; durLoadedRef.current.add(key)
      const u = URL.createObjectURL(h.file!)
      const done = (d: number) => { URL.revokeObjectURL(u); if (alive && d > 0 && isFinite(d)) setDurs((p) => ({ ...p, [key]: d })); next() }
      el.onloadedmetadata = () => done(el.duration || 0)
      el.onerror = () => done(0)
      el.src = u
    }
    next()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])
  useEffect(() => { try { const s = localStorage.getItem('mp_saved_v1'); if (s) setSaved(new Set(JSON.parse(s))) } catch { /* ignore */ } }, [])
  useEffect(() => { try { const s = localStorage.getItem('mp_groups_v1'); if (s) setGroups(JSON.parse(s)) } catch { /* ignore */ } }, [])
  useEffect(() => {
    let alive = true
    mhList().then((items) => {
      if (!alive || !items.length) return
      const restored = items.map((it) => ({ name: it.name, size: it.size, file: it.blob ? new File([it.blob], it.name, { type: it.type }) : null }))
      setHistory((h) => { const seen = new Set(h.map((x) => x.name + '|' + x.size)); return [...h, ...restored.filter((r) => !seen.has(r.name + '|' + r.size))].slice(0, 999) })
    })
    return () => { alive = false }
  }, [])

  const writePositions = () => { try { localStorage.setItem('mp_pos_v1', JSON.stringify(positionsRef.current)) } catch { /* ignore */ } }
  const savePos = (time: number, flush = false) => {
    const key = curFile ? curFile.name + '|' + curFile.size : ''
    if (!key || !(time > 0)) return
    positionsRef.current[key] = time
    const now = Date.now()
    if (flush || now - posSaveTsRef.current > 3000) { posSaveTsRef.current = now; writePositions() }
  }
  const clearPos = () => { const key = curFile ? curFile.name + '|' + curFile.size : ''; if (key && positionsRef.current[key] != null) { delete positionsRef.current[key]; writePositions() } }

  // ---- load a track ----
  const load = useCallback((f: File, advance = false) => {
    try {
      if (/^(image|video|text)\//.test(f.type)) { setNotice({ msg: `${f.name} — ${f.type}`, err: true }); return } // clearly not audio
      setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) })
      setBase(f.name.replace(/\.[^.]+$/, '') || f.name)
      setCur(0)
      resumePosRef.current = positionsRef.current[f.name + '|' + f.size] || 0
      setCurFile(f)
      // Playing a track that's already in the list keeps its position; only a brand-new file goes on top.
      if (!advance) setHistory((h) => h.some((x) => x.name === f.name && x.size === f.size)
        ? h.map((x) => (x.name === f.name && x.size === f.size ? { name: f.name, size: f.size, file: f } : x))
        : [{ name: f.name, size: f.size, file: f }, ...h].slice(0, 999))
      const id = f.name + '|' + f.size
      const meta = { id, name: f.name, size: f.size, type: f.type }
      if (savedRef.current.has(id)) mhSave(meta, f); else if (autoSaveRef.current) mhAutoSave(meta, f); else mhPutMeta(meta)
      trackToolUsed('music-player')
    } catch (e) { setNotice({ msg: `load: ${(e as Error)?.message || e}`, err: true }) }
  }, [])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  // Playlist filtered by the open tab; next/prev cycle it (skipping metadata-only entries with no blob).
  const shownAll = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
  const shown = query.trim() ? shownAll.filter((h) => h.name.toLowerCase().includes(query.trim().toLowerCase())) : shownAll
  // Display metadata for the now-playing card: ID3 (local) → iTunes (network) → "Artist - Title" filename.
  const fnParts = (base || '').split(/\s+[-–—]\s+/)
  const coverSrc = id3?.cover || artUrl
  const dispTitle = id3?.title || itTitle || (fnParts.length >= 2 ? fnParts.slice(1).join(' - ') : base)
  const dispArtist = id3?.artist || itArtist || (fnParts.length >= 2 ? fnParts[0] : '')
  const activeLyric = lyricsLines ? lyricsLines.reduce((a, l, i) => (l.t <= cur + 0.25 ? i : a), -1) : -1 // current synced line
  const allCount = history.length
  const savedCount = history.filter((h) => saved.has(h.name + '|' + h.size)).length
  const firstPlayable = history.find((h) => h.file) // for the play button when nothing is loaded yet
  // ---- drag-to-reorder (pointer events so it works on touch / mobile too) ----
  const startDrag = (key: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    dragKeyRef.current = key; setDragKey(key)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  const onDragMove = (e: React.PointerEvent) => {
    const from = dragKeyRef.current; if (!from) return
    // Find the row under the pointer and move the dragged track to its slot (전체 order === history order).
    const rows = Array.from(listRef.current?.children || []) as HTMLElement[]
    let over: string | null = null
    for (const row of rows) { const r = row.getBoundingClientRect(); if (e.clientY >= r.top && e.clientY <= r.bottom) { over = row.dataset.key || null; break } }
    if (!over || over === from) return
    setHistory((h) => {
      const i = h.findIndex((x) => x.name + '|' + x.size === from)
      const j = h.findIndex((x) => x.name + '|' + x.size === over)
      if (i < 0 || j < 0 || i === j) return h
      const n = [...h]; const [it] = n.splice(i, 1); n.splice(j, 0, it); return n
    })
  }
  const endDrag = (e: React.PointerEvent) => {
    dragKeyRef.current = null; setDragKey(null)
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  // The track list next/prev cycle: all songs, or — when browsing a group — that group's songs.
  const activeList = () => histTab === 'all'
    ? history
    : (openGroup && openGroup !== 'fav')
      ? history.filter((h) => (groups.find((g) => g.id === openGroup)?.keys || []).includes(h.name + '|' + h.size))
      : history.filter((h) => saved.has(h.name + '|' + h.size))
  function playNext() {
    const list = activeList()
    if (!list.some((x) => x.file)) { dirRef.current?.click(); return } // no songs → open the folder picker
    if (repeatMode === 'shuffle') {
      const pool = list.filter((x) => x.file && x.file !== curFile)
      const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : list.find((x) => x.file)
      if (pick?.file) load(pick.file, true)
      return
    }
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : -1
    for (let step = 1; step <= list.length; step++) { const n = list[(idx + step) % list.length]; if (n?.file) { load(n.file, true); return } }
  }
  function playPrev() {
    const list = activeList()
    if (!list.some((x) => x.file)) { dirRef.current?.click(); return } // no songs → open the folder picker
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : 0
    for (let step = 1; step <= list.length; step++) { const p = list[(idx - step + list.length) % list.length]; if (p?.file) { load(p.file, true); return } }
  }

  const media = () => audioRef.current
  // Build the Web Audio graph once (only when the equalizer is on). Routing is permanent for the
  // element, so we only do it on demand to keep default background playback untouched.
  const setupEqGraph = () => {
    if (eqSrcRef.current || !audioRef.current) return
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return
      const ctx = new Ctx()
      const src = ctx.createMediaElementSource(audioRef.current)
      const an = ctx.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = 0.8
      src.connect(an); an.connect(ctx.destination)
      audioCtxRef.current = ctx; analyserRef.current = an; eqSrcRef.current = src
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch { /* ignore */ }
  }
  // Drive the equalizer bars from real frequency data while it's visible and playing.
  useEffect(() => {
    if (!eqEnabled || !playing) { if (eqRafRef.current) cancelAnimationFrame(eqRafRef.current); return }
    if (!analyserRef.current) { setupEqGraph(); audioCtxRef.current?.resume?.() }
    const an = analyserRef.current; if (!an) return
    const bins = an.frequencyBinCount; const data = new Uint8Array(bins)
    const loop = () => {
      an.getByteFrequencyData(data)
      const bars = eqWrapRef.current?.children; const refl = eqReflRef.current?.children
      if (bars) for (let i = 0; i < bars.length; i++) { const bin = Math.min(bins - 1, Math.floor((i / bars.length) * bins * 0.7) + 1); const v = Math.max(0.05, data[bin] / 255); const h = (v * 100) + '%'; (bars[i] as HTMLElement).style.height = h; if (refl && refl[i]) (refl[i] as HTMLElement).style.height = h }
      eqRafRef.current = requestAnimationFrame(loop)
    }
    eqRafRef.current = requestAnimationFrame(loop)
    return () => { if (eqRafRef.current) cancelAnimationFrame(eqRafRef.current) }
  }, [eqEnabled, playing])
  const togglePlay = () => { const a = media(); if (!a || !url) return; if (a.paused) { if (eqEnabled) { setupEqGraph(); audioCtxRef.current?.resume?.() } a.play().catch(() => {}) } else a.pause() }
  const seekTo = (time: number) => { const a = media(); if (a) a.currentTime = time }
  const seekBy = (d: number) => { const a = media(); if (a) a.currentTime = Math.max(0, Math.min(a.duration || a.currentTime, a.currentTime + d)) }
  const setVol = (v: number) => { const a = media(); if (a) a.volume = v; setVolume(v) }

  // Keep the active synced-lyric line centred in its box (scrolls only the box, not the page).
  useEffect(() => {
    if (activeLyric < 0 || !lyricsBoxRef.current) return
    const box = lyricsBoxRef.current; const el = box.children[activeLyric] as HTMLElement | undefined
    if (el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
  }, [activeLyric])

  // apply speed / volume / loop to the element
  useEffect(() => { const a = audioRef.current; if (a) a.playbackRate = speed }, [speed, url])
  useEffect(() => { const a = audioRef.current; if (a) a.loop = repeatMode === 'one' }, [repeatMode, url])

  // ---- ★ save (persist the audio blob so it replays in one click) ----
  const toggleSaved = useCallback((key: string, file: File | null) => {
    setSaved((prev) => {
      const n = new Set(prev); const willSave = !n.has(key)
      if (willSave) { n.add(key); if (file) { const [, sz] = key.split('|'); mhSave({ id: key, name: file.name, size: +sz || file.size, type: file.type }, file) } } else { n.delete(key); mhSetBlob(key, null) }
      try { localStorage.setItem('mp_saved_v1', JSON.stringify(Array.from(n))) } catch { /* ignore */ }
      return n
    })
  }, [])

  const removeItem = (key: string) => {
    setHistory((h) => h.filter((x) => x.name + '|' + x.size !== key))
    setSaved((prev) => { if (!prev.has(key)) return prev; const n = new Set(prev); n.delete(key); try { localStorage.setItem('mp_saved_v1', JSON.stringify(Array.from(n))) } catch { /* ignore */ } return n })
    setGroups((g) => { if (!g.some((x) => x.keys.includes(key))) return g; const ng = g.map((x) => ({ ...x, keys: x.keys.filter((k) => k !== key) })); saveGroups(ng); return ng })
    mhDelete(key)
  }

  // ---- groups ----
  const saveGroups = (g: { id: string; name: string; keys: string[] }[]) => { try { localStorage.setItem('mp_groups_v1', JSON.stringify(g)) } catch { /* ignore */ } }
  // A blob stays persisted while the track is in 즐겨찾기 OR any group; drop it once it's in none.
  const dropBlobIfOrphan = (key: string, groupsNow: { keys: string[] }[]) => { if (!savedRef.current.has(key) && !groupsNow.some((x) => x.keys.includes(key))) mhSetBlob(key, null) }
  const createGroup = () => {
    const nm = newName.trim(); if (!nm) { setCreating(false); setNewName(''); return }
    setGroups((g) => { const ng = [...g, { id: 'g' + Date.now().toString(36), name: nm, keys: [] }]; saveGroups(ng); return ng })
    setNewName(''); setCreating(false)
  }
  const deleteGroup = (id: string) => {
    setGroups((g) => {
      const removed = g.find((x) => x.id === id); const ng = g.filter((x) => x.id !== id); saveGroups(ng)
      if (removed) for (const k of removed.keys) dropBlobIfOrphan(k, ng) // persisted blobs no longer needed
      return ng
    })
    if (openGroup === id) setOpenGroup(null)
  }
  const toggleInGroup = (id: string, key: string, file: File | null) => {
    setGroups((g) => {
      const ng = g.map((x) => (x.id === id ? { ...x, keys: x.keys.includes(key) ? x.keys.filter((k) => k !== key) : [...x.keys, key] } : x)); saveGroups(ng)
      if (ng.find((x) => x.id === id)?.keys.includes(key)) { if (file) { const [, sz] = key.split('|'); mhSave({ id: key, name: file.name, size: +sz || file.size, type: file.type }, file) } }
      else dropBlobIfOrphan(key, ng)
      return ng
    })
  }
  // Songs of a group, in the playlist's OWN order (custom = keys order · 즐겨찾기 = ★ insertion order).
  const groupKeys = (id: string) => (id === 'fav' ? saved : new Set(groups.find((g) => g.id === id)?.keys || []))
  const groupSongs = (id: string) => {
    const byKey = new Map(history.map((h) => [h.name + '|' + h.size, h] as const))
    const order = id === 'fav' ? Array.from(saved) : (groups.find((g) => g.id === id)?.keys || [])
    return order.map((k) => byKey.get(k)).filter((h): h is { name: string; size: number; file: File | null } => !!h)
  }
  // Reorder a track within a playlist (drag): move `fromKey` to `toKey`'s slot. Updates the live
  // ref synchronously (so consecutive drag-moves are consistent); persistence happens once on drop.
  const reorderGroup = (id: string, fromKey: string, toKey: string) => {
    if (id === 'fav') {
      const arr = Array.from(savedRef.current); const i = arr.indexOf(fromKey), j = arr.indexOf(toKey)
      if (i < 0 || j < 0 || i === j) return
      arr.splice(j, 0, arr.splice(i, 1)[0])
      const n = new Set(arr); savedRef.current = n; setSaved(n)
    } else {
      const gs = groupsRef.current; const gi = gs.findIndex((g) => g.id === id); if (gi < 0) return
      const arr = [...gs[gi].keys]; const i = arr.indexOf(fromKey), j = arr.indexOf(toKey)
      if (i < 0 || j < 0 || i === j) return
      arr.splice(j, 0, arr.splice(i, 1)[0])
      const ng = [...gs]; ng[gi] = { ...gs[gi], keys: arr }; groupsRef.current = ng; setGroups(ng)
    }
  }
  const onGroupDragMove = (e: React.PointerEvent) => {
    const from = dragKeyRef.current; if (!from || !openGroup) return
    const rows = Array.from(groupListRef.current?.children || []) as HTMLElement[]
    let over: string | null = null
    for (const row of rows) { const r = row.getBoundingClientRect(); if (e.clientY >= r.top && e.clientY <= r.bottom) { over = row.dataset.key || null; break } }
    if (over && over !== from) reorderGroup(openGroup, from, over)
  }
  // Drop: persist the playlist's new order once, from the ref (avoids write-in-updater quirks).
  const endGroupDrag = (e: React.PointerEvent) => {
    endDrag(e)
    if (openGroup === 'fav') { try { localStorage.setItem('mp_saved_v1', JSON.stringify(Array.from(savedRef.current))) } catch { /* ignore */ } }
    else if (openGroup) saveGroups(groupsRef.current)
  }
  const groupName = (id: string) => (id === 'fav' ? t('mpl_fav') : groups.find((g) => g.id === id)?.name || '')
  const inGroup = (id: string, key: string, file: File | null) => (id === 'fav' ? toggleSaved(key, file) : toggleInGroup(id, key, file))
  // Create a brand-new group from the long-press popup and drop the song straight into it.
  const createFromMenu = () => {
    const nm = menuNewName.trim(); if (!nm || !menuFor) { setMenuCreating(false); setMenuNewName(''); return }
    const key = menuFor.key, file = menuFor.file
    setGroups((g) => { const ng = [...g, { id: 'g' + Date.now().toString(36), name: nm, keys: [key] }]; saveGroups(ng); return ng })
    if (file) { const [, sz] = key.split('|'); mhSave({ id: key, name: file.name, size: +sz || file.size, type: file.type }, file) }
    setMenuNewName(''); setMenuCreating(false); setMenuFor(null)
  }
  const closeMenu = () => { setMenuFor(null); setMenuCreating(false); setMenuNewName('') }
  // ★ popup: create a new playlist and drop the CURRENTLY PLAYING track into it.
  const createForCurrent = () => {
    const nm = menuNewName.trim(); if (!nm || !curFile) { setMenuCreating(false); setMenuNewName(''); return }
    const key = curFile.name + '|' + curFile.size
    setGroups((g) => { const ng = [...g, { id: 'g' + Date.now().toString(36), name: nm, keys: [key] }]; saveGroups(ng); return ng })
    const [, sz] = key.split('|'); mhSave({ id: key, name: curFile.name, size: +sz || curFile.size, type: curFile.type }, curFile)
    setMenuNewName(''); setMenuCreating(false)
  }
  const closeStar = () => { setStarMenu(false); setMenuCreating(false); setMenuNewName('') }
  // Long-press a track → open the "add to group" popup. The play click is suppressed by measuring how
  // long the press lasted (a held press ≥ 450ms is a long-press, not a tap) — robust to event ordering.
  const startPress = (h: { name: string; size: number; file: File | null }) => () => {
    pressStartRef.current = Date.now()
    if (pressRef.current) clearTimeout(pressRef.current)
    pressRef.current = setTimeout(() => { pressRef.current = null; try { window.getSelection()?.removeAllRanges() } catch { /* ignore */ } setMenuFor({ key: h.name + '|' + h.size, file: h.file, name: h.name }) }, 500)
  }
  const cancelPress = () => { if (pressRef.current) { clearTimeout(pressRef.current); pressRef.current = null } }
  const wasLongPress = () => Date.now() - pressStartRef.current >= 450

  // Shared row content (play icon + name/size) reused by the 전체 list and the group views.
  const trackInner = (h: { name: string; size: number; file: File | null }) => {
    const key = h.name + '|' + h.size
    const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
    return (
      <>
        <span className={'w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg ' + (isCur && playing ? 'bg-brand-600 text-white' : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')}>
          {isCur && playing ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z" /></svg>}
        </span>
        <span className="min-w-0">
          <span className={'block truncate text-sm ' + (isCur ? 'font-semibold text-brand-500' : darkMode ? 'text-gray-200' : 'text-gray-800') + (h.file ? '' : ' opacity-50')}>{h.name.replace(/\.[^.]+$/, '')}</span>
          <span className="block text-[11px] text-gray-400 tabular-nums">{h.file ? <>{durs[key] ? <span className="text-gray-500">{fmt(durs[key])}</span> : null}{durs[key] ? ' · ' : ''}{fmtSize(h.size)}</> : t('mp_reopen')}</span>
        </span>
      </>
    )
  }
  // Clickable play/label wrapper: load the track + scroll to the card (dimmed track → re-open folder).
  const trackOpen = (h: { name: string; size: number; file: File | null }) => h.file
    ? <button
        onClick={() => { if (wasLongPress()) return; load(h.file!); cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        onPointerDown={startPress(h)} onPointerUp={cancelPress} onPointerLeave={cancelPress} onPointerCancel={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        className="flex-1 min-w-0 flex items-center gap-2 text-left select-none [-webkit-touch-callout:none] [-webkit-user-select:none]">{trackInner(h)}</button>
    : <label htmlFor="mp-folder" title={t('mp_reopen')} className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer">{trackInner(h)}</label>

  const clearAll = () => { setHistory([]); setSaved(new Set()); setCurFile(null); setUrl((u) => { if (u) URL.revokeObjectURL(u); return '' }); setBase(''); setPlaying(false); try { localStorage.removeItem('mp_saved_v1') } catch { /* ignore */ } mhClear() }

  // ---- file inputs / drag-drop ----
  const addFiles = useCallback((list: FileList | File[] | null, trusted = false) => {
    // The audio picker (accept="audio/*") already limits the OS to audio, so trust its selection even
    // when a mobile media picker returns a blank MIME type / a name without extension. Folders and
    // drag-drop can include anything, so those still filter to audio.
    const all = Array.from(list || [])
    const files = (trusted ? all : all.filter(maybeAudio))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })) // name order, like the file explorer
    if (!files.length) return
    setHistory((h) => {
      // Re-attach the real blob to any metadata-only (dimmed) entry the folder re-supplies, so it turns playable.
      const byKey = new Map(files.map((f) => [f.name + '|' + f.size, f] as const))
      const merged = h.map((x) => { const f = byKey.get(x.name + '|' + x.size); return f && !x.file ? { name: x.name, size: x.size, file: f } : x })
      const seen = new Set(h.map((x) => x.name + '|' + x.size))
      const add = files.filter((f) => !seen.has(f.name + '|' + f.size)).map((f) => ({ name: f.name, size: f.size, file: f }))
      return [...add, ...merged].slice(0, 999)
    })
    mhPutManyMeta(files.map((f) => ({ id: f.name + '|' + f.size, name: f.name, size: f.size, type: f.type })))
    if (autoSaveRef.current) mhAutoSaveMany(files) // cache blobs in the background so the whole list replays after refresh
    setRenderN(80) // only render the first window so a big folder doesn't freeze the UI
    load(files[0])
  }, [load])
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const fs = e.dataTransfer?.files; if (fs?.length) { e.preventDefault(); addFiles(fs) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
  }, [addFiles])

  // ---- sleep timer ----
  useEffect(() => {
    if (sleepRef.current) { clearInterval(sleepRef.current); sleepRef.current = null }
    if (!sleepMin) { setSleepLeft(0); return }
    let left = sleepMin * 60; setSleepLeft(left)
    sleepRef.current = setInterval(() => { left -= 1; setSleepLeft(left); if (left <= 0) { audioRef.current?.pause(); if (sleepRef.current) clearInterval(sleepRef.current); sleepRef.current = null; setSleepMin(0); showToast(t('mpl_timer_done')) } }, 1000)
    return () => { if (sleepRef.current) clearInterval(sleepRef.current) }
  }, [sleepMin])

  // ---- MediaSession: lock-screen controls + background playback ----
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ms = typeof navigator !== 'undefined' ? (navigator as any).mediaSession : null
    if (!ms) return
    if (!url) { try { ms.metadata = null } catch { /* ignore */ } return }
    try { const MM = (window as any).MediaMetadata; if (MM) ms.metadata = new MM({ title: dispTitle || base, artist: dispArtist || 'ToolBoxy', artwork: [{ src: coverSrc || '/icons/music-player.png', sizes: '512x512', type: coverSrc ? '' : 'image/png' }] }) } catch { /* ignore */ }
    const a = () => audioRef.current
    const set = (action: string, handler: any) => { try { ms.setActionHandler(action, handler) } catch { /* unsupported */ } }
    set('play', () => a()?.play().catch(() => {}))
    set('pause', () => a()?.pause())
    set('previoustrack', () => playPrev())
    set('nexttrack', () => playNext())
    set('seekbackward', (d: any) => { const el = a(); if (el) el.currentTime = Math.max(0, el.currentTime - (d?.seekOffset || 10)) })
    set('seekforward', (d: any) => { const el = a(); if (el) el.currentTime = Math.min(el.duration || 0, el.currentTime + (d?.seekOffset || 10)) })
    set('seekto', (d: any) => { const el = a(); if (el && d?.seekTime != null) el.currentTime = d.seekTime })
    return () => { ['play', 'pause', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward', 'seekto'].forEach((x) => set(x, null)) }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, base, dispTitle, dispArtist, coverSrc])

  // Repeat button now cycles all(A) → one(1) → shuffle → off, so shuffle lives here (its old slot is the timer).
  const cycleRepeat = () => setRepeatMode((m) => (m === 'all' ? 'one' : m === 'one' ? 'shuffle' : m === 'shuffle' ? 'off' : 'all'))

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4 max-w-lg mx-auto">
        {/* accept="audio/*" is the clean audio filter on desktop / Chrome. On Samsung Internet ANY
            audio-flavoured accept opens a capture chooser (camera/recorder) rather than a file browser,
            so those users use 폴더 열기 (webkitdirectory), which reliably opens the real file browser. */}
        <input ref={inputRef} id="mp-file" type="file" accept="audio/*" multiple className="hidden" onChange={(e) => {
          const fl = Array.from(e.target.files || [])
          setNotice(fl.length ? { msg: `${t('mp_selected')} ${fl.length} · ${fl[0].name} · ${fl[0].type || 'no-type'} · ${fmtSize(fl[0].size)}` } : { msg: t('mp_none_sel'), err: true })
          addFiles(e.target.files, true); e.target.value = ''
        }} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <input ref={dirRef} id="mp-folder" type="file" {...({ webkitdirectory: '', directory: '' } as any)} className="hidden" onChange={(e) => {
          const fl = Array.from(e.target.files || []); const audio = fl.filter(maybeAudio)
          setNotice(fl.length ? { msg: `${t('mp_folder')}: ${fl.length} / audio ${audio.length}${fl[0] ? ` · ex: ${fl[0].name} (${fl[0].type || 'no-type'})` : ''}`, err: !audio.length } : { msg: t('mp_none_sel'), err: true })
          addFiles(e.target.files); e.target.value = ''
        }} />
        {/* Hidden audio engine (keeps playing screen-off; MediaSession drives the lock screen). */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src={url || undefined} preload="metadata"
          onLoadedMetadata={(e) => {
            const a = e.currentTarget; setDur(a.duration); a.playbackRate = speed; a.volume = volume; a.loop = repeatMode === 'one'
            if (curFile && a.duration > 0 && isFinite(a.duration)) { const k = curFile.name + '|' + curFile.size; durLoadedRef.current.add(k); setDurs((p) => ({ ...p, [k]: a.duration })) }
            if (resumePosRef.current > 1 && a.duration && resumePosRef.current < a.duration - 2) { try { a.currentTime = resumePosRef.current } catch { /* ignore */ } }
            resumePosRef.current = 0
            a.play().catch(() => {})
          }}
          onPlay={() => { setPlaying(true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'playing' } catch { /* ignore */ } }}
          onPause={(e) => { setPlaying(false); savePos(e.currentTarget.currentTime, true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'paused' } catch { /* ignore */ } }}
          onEnded={() => { clearPos(); if (repeatMode === 'all' || repeatMode === 'shuffle') playNext() }}
          onError={() => { const err = audioRef.current?.error; setNotice({ msg: `${t('mp_play_err')} (code ${err?.code ?? '?'})${err?.message ? ' ' + err.message : ''}`, err: true }) }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget; setCur(a.currentTime); savePos(a.currentTime)
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const ms = (navigator as any).mediaSession
            if (ms?.setPositionState && a.duration && isFinite(a.duration)) { try { ms.setPositionState({ duration: a.duration, position: Math.min(a.currentTime, a.duration), playbackRate: a.playbackRate || 1 }) } catch { /* ignore */ } }
          }} />

        {/* Transient toast (e.g. the sleep timer stopped playback). */}
        {toast && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-900 text-white text-sm px-4 py-2.5 shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></svg>
            <span className="flex-1">{toast}</span>
          </div>
        )}

        {/* On-screen diagnostic — only surface real errors; the informational (grey) picks stay hidden. */}
        {notice && notice.err && (
          <div className={'flex items-start gap-2 rounded-xl px-3 py-2 text-xs break-all bg-red-50 text-red-700 border border-red-200'}>
            <span className="flex-1 font-mono leading-relaxed">{notice.msg}</span>
            <button onClick={() => setNotice(null)} aria-label="dismiss" className="shrink-0 text-current opacity-60 hover:opacity-100"><ToolIcon name="x" className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {(
          /* The player is the default screen (even when empty); the play button opens the folder.
             space-y-px keeps the player and the list box ~1px apart. */
          <div className="space-y-px">
            {/* ---- Now-playing card ---- */}
            <div ref={cardRef} className={'rounded-2xl text-white shadow-sm overflow-hidden scroll-mt-16 bg-gradient-to-b ' + (darkMode ? 'from-gray-800 to-black' : 'from-brand-500 to-brand-700')}>
              <div className="p-5">
              {/* Album art is a fixed height and the gauge slot below is always reserved, so opening a
                  submenu never resizes anything (no layout shake). */}
              <div className="w-full h-60 flex items-center justify-center rounded-2xl bg-white/10 overflow-hidden">
                {coverSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverSrc} alt="" className="w-full h-full object-cover" onError={() => setArtUrl('')} />
                ) : eqEnabled && playing ? (
                  /* Real audio-synced equalizer: bars driven from frequency data via rAF, each with a
                     small white cap, plus a faint mirrored reflection underneath (like the reference). */
                  <div className="w-full h-36 flex flex-col justify-center px-6" aria-hidden>
                    {/* Segmented bars: fixed-size boxes stacked bottom-up (VU-meter style). The
                        repeating-gradient makes the stacked-box pattern; height reveals more boxes. */}
                    <div ref={eqWrapRef} className="h-24 flex items-end justify-center gap-[3px]">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hue = Math.round(200 + (i / 24) * 160) // teal → blue → violet → pink
                        return <span key={i} className="flex-1 max-w-[7px] rounded-[1px] transition-[height] duration-75 ease-out" style={{ height: '5%', background: `repeating-linear-gradient(to top, hsl(${hue} 95% 60%) 0, hsl(${hue} 95% 60%) 5px, transparent 5px, transparent 8px)`, boxShadow: `0 0 6px hsl(${hue} 95% 65% / 0.45)` }} />
                      })}
                    </div>
                    {/* Reflection: the same stacked boxes mirrored, moving in lockstep (same height). */}
                    <div ref={eqReflRef} className="h-10 flex items-start justify-center gap-[3px] opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent_95%)]">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hue = Math.round(200 + (i / 24) * 160)
                        return <span key={i} className="flex-1 max-w-[7px] rounded-[1px] transition-[height] duration-75 ease-out" style={{ height: '5%', background: `repeating-linear-gradient(to bottom, hsl(${hue} 95% 60%) 0, hsl(${hue} 95% 60%) 5px, transparent 5px, transparent 8px)` }} />
                      })}
                    </div>
                  </div>
                ) : (
                  /* No cover: a music note that opens the folder on click ("Click" prompt when empty). */
                  <label htmlFor="mp-folder" title={t('mp_folder')} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 opacity-90"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                    {history.length === 0 && <span className="mt-3 text-sm font-medium text-white/80">{t('mpl_click')}</span>}
                  </label>
                )}
              </div>
              {/* Title + artist (ID3 → iTunes → filename). Artist shows as a smaller second line. */}
              <div className="mt-4 text-center">
                <p className="font-semibold truncate">{dispTitle || t('mp_nothing')}</p>
                {dispArtist && <p className="text-sm text-white/70 truncate mt-0.5">{dispArtist}</p>}
              </div>
              {/* seek */}
              <input type="range" min={0} max={dur || 0} step={0.1} value={Math.min(cur, dur || 0)} onChange={(e) => seekTo(+e.target.value)} aria-label="seek"
                className="w-full mt-4 h-1.5 accent-white cursor-pointer" disabled={!url} />
              <div className="flex justify-between text-xs font-mono text-white/80"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
              {/* seek row (−30/−10/−5 · +5/+10/+30) — now ABOVE the transport row */}
              {url && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[30, 10, 5].map((n) => (
                    <button key={'m' + n} onClick={() => seekBy(-n)} aria-label={`-${n}s`} className="inline-flex items-center gap-0.5 h-8 px-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold active:scale-95 transition tabular-nums">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6z" /></svg>{n}
                    </button>
                  ))}
                  <span aria-hidden className="w-8 h-8 rounded-full border border-white/25 shrink-0" />
                  {[5, 10, 30].map((n) => (
                    <button key={'p' + n} onClick={() => seekBy(n)} aria-label={`+${n}s`} className="inline-flex items-center gap-0.5 h-8 px-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold active:scale-95 transition tabular-nums">
                      {n}<svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M13 6v12l8.5-6L13 6zM4 6l8.5 6L4 18z" /></svg>
                    </button>
                  ))}
                </div>
              )}
              {/* transport — repeat · prev · play · next · list (repeat and list swapped) */}
              <div className="flex items-center justify-center gap-3 mt-3 text-white">
                <button onClick={cycleRepeat} aria-label={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'shuffle' ? 'mp_shuffle' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} title={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'shuffle' ? 'mp_shuffle' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (repeatMode !== 'off' ? 'bg-white/25' : 'hover:bg-white/15')}>
                  {repeatMode === 'shuffle'
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></svg>
                    : <span className="relative inline-flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12a10 10 0 0 1 17-7" /><path d="M22 12a10 10 0 0 1-17 7" /><path d="m19 2 .5 3.3-3.3.5" /><path d="m5 22-.5-3.3 3.3-.5" /></svg>{(repeatMode === 'one' || repeatMode === 'all') && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{repeatMode === 'all' ? 'A' : '1'}</span>}</span>}
                </button>
                <button onClick={() => { playPrev(); flashNav('prev') }} aria-label="previous" className={'w-12 h-12 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (navHi === 'prev' ? 'bg-white/30' : 'hover:bg-white/15')}><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 20 9 12l10-8z" /><rect x="4" y="4" width="2.4" height="16" rx="1" /></svg></button>
                {url ? (
                  <button onClick={togglePlay} aria-label="play" className="w-16 h-16 inline-flex items-center justify-center rounded-full bg-white text-brand-700 hover:bg-white/90 active:scale-95 transition shadow">
                    {playing ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5v14l11-7z" /></svg>}
                  </button>
                ) : firstPlayable ? (
                  /* Nothing loaded but the playlist has a playable track → start it. */
                  <button onClick={() => load(firstPlayable.file!)} aria-label="play" className="w-16 h-16 inline-flex items-center justify-center rounded-full bg-white text-brand-700 hover:bg-white/90 active:scale-95 transition shadow">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                ) : (
                  /* Empty playlist → the play button opens the folder picker so users can add music. */
                  <label htmlFor="mp-folder" aria-label={t('mp_folder')} title={t('mp_folder')} className="w-16 h-16 inline-flex items-center justify-center rounded-full bg-white text-brand-700 hover:bg-white/90 active:scale-95 transition shadow cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5v14l11-7z" /></svg>
                  </label>
                )}
                <button onClick={() => { playNext(); flashNav('next') }} aria-label="next" className={'w-12 h-12 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (navHi === 'next' ? 'bg-white/30' : 'hover:bg-white/15')}><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="m5 4 10 8-10 8z" /><rect x="17.6" y="4" width="2.4" height="16" rx="1" /></svg></button>
                {/* Jump down to the playlist / group list */}
                <button onClick={() => playlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} aria-label={t('mpl_gotolist')} title={t('mpl_gotolist')} className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/25 hover:bg-white/30 active:scale-95 transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
              </div>
              </div>{/* end padded content */}
              {/* gauge slot — ALWAYS reserved (fixed height, empty when closed) so opening a submenu never shifts the layout */}
              {(
                <div className="h-20 flex flex-col justify-center overflow-hidden pb-1">
                  {/* All three submenus share the speed-menu layout: slider + value on top, preset chips below. */}
                  {panel === 'vol' && (
                    <div className="px-5 text-white space-y-2">
                      <div className="flex items-center gap-3">
                        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVol(+e.target.value)} aria-label="volume" className="flex-1 h-1.5 accent-white cursor-pointer" />
                        <span className="text-xs font-mono tabular-nums text-white/80 w-10 text-right">{Math.round(volume * 100)}%</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {VOLUMES.map((v) => <button key={v} onClick={() => setVol(v)} className={'px-2 h-6 rounded text-[11px] tabular-nums transition ' + (volume === v ? 'bg-white text-brand-700 font-bold' : 'bg-white/15 hover:bg-white/25')}>{Math.round(v * 100)}</button>)}
                      </div>
                    </div>
                  )}
                  {panel === 'speed' && (
                    <div className="px-5 text-white space-y-2">
                      <div className="flex items-center gap-3">
                        <input type="range" min={0.5} max={2} step={0.05} value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-label={t('mp_speed')} className="flex-1 h-1.5 accent-white cursor-pointer" />
                        <span className="text-xs font-mono tabular-nums text-white/80 w-10 text-right">{speed}×</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {SPEEDS.map((s) => <button key={s} onClick={() => setSpeed(s)} className={'px-2 h-6 rounded text-[11px] tabular-nums transition ' + (speed === s ? 'bg-white text-brand-700 font-bold' : 'bg-white/15 hover:bg-white/25')}>{s}×</button>)}
                      </div>
                    </div>
                  )}
                  {panel === 'timer' && (
                    <div className="px-5 text-white space-y-2">
                      <div className="flex items-center gap-3">
                        <input type="range" min={0} max={120} step={5} value={sleepMin} onChange={(e) => setSleepMin(+e.target.value)} aria-label={t('mp_timer')} className="flex-1 h-1.5 accent-white cursor-pointer" />
                        <span className="text-xs font-mono tabular-nums text-white/80 w-12 text-right">{sleepMin > 0 ? `${Math.floor(sleepLeft / 60)}:${String(sleepLeft % 60).padStart(2, '0')}` : t('mp_timer_off')}</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {TIMER_MENU.map((m) => <button key={m} onClick={() => setSleepMin(m)} className={'px-2 h-6 rounded text-[11px] tabular-nums transition ' + (sleepMin === m ? 'bg-white text-brand-700 font-bold' : 'bg-white/15 hover:bg-white/25')}>{t('ct_min', { n: m })}</button>)}
                        <button onClick={() => setSleepMin(0)} className={'px-2 h-6 rounded text-[11px] transition ' + (sleepMin === 0 ? 'bg-white text-brand-700 font-bold' : 'bg-white/15 hover:bg-white/25')}>{t('mp_timer_off')}</button>
                      </div>
                    </div>
                  )}
                  {/* No submenu open → use the reserved slot for the live (synced) lyric line. */}
                  {panel === 'none' && lyricsLines && activeLyric >= 0 && (
                    <div className="px-5 text-center text-white select-none" aria-hidden>
                      {[activeLyric - 1, activeLyric, activeLyric + 1].map((idx, k) => {
                        const l = lyricsLines[idx]
                        return <p key={k} className={'truncate h-6 leading-6 transition-all ' + (idx === activeLyric ? 'text-sm font-semibold' : 'text-xs text-white/45')}>{l ? (l.text || '♪') : ''}</p>
                      })}
                    </div>
                  )}
                </div>
              )}
              {/* bottom bar — 설정 / 소리 / 속도 / 타이머 icon buttons, flat-bottomed and flush to the card edge */}
              <div className="flex border-t border-white/15 text-white">
                <button onClick={() => setShowSettings(true)} aria-label={t('mpl_settings')} title={t('mpl_settings')} className="flex-1 inline-flex items-center justify-center py-3.5 active:opacity-80 transition hover:bg-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                </button>
                <button onClick={() => setPanel((p) => (p === 'vol' ? 'none' : 'vol'))} aria-label={t('mpl_vol')} title={t('mpl_vol')} className={'flex-1 inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition ' + (panel === 'vol' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">{volume === 0 ? <><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></> : <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" /></>}</svg>
                </button>
                <button onClick={() => setPanel((p) => (p === 'speed' ? 'none' : 'speed'))} aria-label={t('mp_speed')} title={`${t('mp_speed')} ${speed}×`} className={'flex-1 inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition ' + (panel === 'speed' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <span className="text-sm font-bold tabular-nums leading-none">{speed}×</span>
                </button>
                <button onClick={() => setPanel((p) => (p === 'timer' ? 'none' : 'timer'))} aria-label={t('mp_timer')} title={t('mp_timer')} className={'flex-1 relative inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition ' + (sleepMin || panel === 'timer' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></svg>
                  {sleepMin > 0 && <span className="absolute top-1 right-1/2 translate-x-[24px] text-[9px] font-mono font-bold tabular-nums leading-none">{Math.floor(sleepLeft / 60)}:{String(sleepLeft % 60).padStart(2, '0')}</span>}
                </button>
                {/* ★ — add the CURRENT track to a playlist (opens the popup; disabled when nothing loaded) */}
                <button onClick={() => setStarMenu(true)} disabled={!curFile} aria-label={t('mpl_addto_pl')} title={t('mpl_addto_pl')} className="flex-1 inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition hover:bg-white/10 disabled:opacity-40">
                  <svg viewBox="0 0 24 24" fill={curFile && saved.has(curFile.name + '|' + curFile.size) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg>
                </button>
              </div>
            </div>

            {/* ---- Lyrics (lrclib.net): time-synced (active line highlighted + auto-scroll) or plain ---- */}
            {(lyricsLines || lyrics) && (
              <div className={'rounded-2xl border p-4 ' + (darkMode ? 'bg-gray-900 border-gray-700' : 'border-gray-200')}>
                <p className={'text-xs font-semibold mb-2 ' + (darkMode ? 'text-gray-400' : 'text-gray-500')}>{t('mpl_lyrics')}</p>
                {lyricsLines ? (
                  <div ref={lyricsBoxRef} className="max-h-72 overflow-auto space-y-1.5 py-2">
                    {lyricsLines.map((l, i) => (
                      <p key={i} className={'text-center text-sm transition-colors ' + (i === activeLyric ? 'text-brand-500 font-semibold' : darkMode ? 'text-gray-500' : 'text-gray-400')}>{l.text || '♪'}</p>
                    ))}
                  </div>
                ) : (
                  <pre className={'whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-72 overflow-auto ' + (darkMode ? 'text-gray-300' : 'text-gray-700')}>{lyrics}</pre>
                )}
              </div>
            )}

            {/* ---- Playlist (standard list style; dark theme follows the player) ---- */}
            <div ref={playlistRef} className={'rounded-2xl border overflow-hidden scroll-mt-16 ' + (darkMode ? 'bg-gray-900 border-gray-700' : 'border-gray-200')}>
              <div className={'flex items-center gap-1 px-2 border-b ' + (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200')}>
                {/* Reorder toggle (≡): tap to move tracks up/down in the list */}
                <button onClick={() => { setHistTab('all'); setReorder((r) => !r) }} aria-label={t('mpl_reorder')} title={t('mpl_reorder')} className={'p-2 rounded transition-colors ' + (reorder ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:text-brand-600')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
                </button>
                {(['all', 'saved'] as const).map((tab) => (
                  <button key={tab} onClick={() => { setHistTab(tab); setOpenGroup(null); setAddMode(false); setCreating(false); setReorder(false) }} className={'inline-flex items-center gap-1 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ' + (histTab === tab ? (darkMode ? 'border-brand-500 text-brand-400' : 'border-brand-600 text-brand-600') : darkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                    {tab === 'all'
                      ? t('mp_all')
                      : <><span className="sm:hidden">{t('mpl_list')}</span><span className="hidden sm:inline">{t('mpl_playlist')}</span></>}
                    <span className="text-xs font-normal opacity-60 tabular-nums">{tab === 'all' ? allCount : groups.length + 1}</span>
                  </button>
                ))}
                {/* search then file-add (swapped) — the clear-all trash moved into Settings */}
                <button onClick={() => { setSearchOn((s) => !s); if (searchOn) setQuery('') }} aria-label={t('mpl_search')} title={t('mpl_search')} className={'ml-auto p-2 rounded transition-colors ' + (searchOn ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:text-brand-600')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </button>
                <label htmlFor="mp-file" title={t('mp_pick')} className="p-2 text-gray-400 hover:text-brand-600 cursor-pointer"><ToolIcon name="plus" className="w-4 h-4" /></label>
                <label htmlFor="mp-folder" title={t('mp_folder')} className="p-2 text-gray-400 hover:text-brand-600 cursor-pointer"><ToolIcon name="folder" className="w-4 h-4" /></label>
              </div>
              {searchOn && (
                <div className="px-2 py-1.5 border-b border-gray-100">
                  {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('mpl_search')} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                </div>
              )}
              {histTab === 'all' ? (
                /* ---- 전체: every track (reorder · ★ · ✕) ---- */
                shown.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">{t('mp_empty')}</p>
                ) : (
                  <div ref={listRef} onScroll={onListScroll} className={'max-h-[300px] overflow-y-auto divide-y ' + (darkMode ? 'divide-white/10' : 'divide-gray-100')}>
                    {shown.slice(0, renderN).map((h) => {
                      const key = h.name + '|' + h.size
                      const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
                      const star = saved.has(key)
                      return (
                        <div key={key} data-key={key} className={'flex items-center gap-2 px-3 py-2.5 transition-colors ' + (dragKey === key ? 'bg-brand-100 shadow-inner' : isCur ? (darkMode ? 'bg-white/15' : 'bg-brand-50') : '')}>
                          {/* Reorder mode: a drag handle on the LEFT — press & drag it to move the track. */}
                          {reorder && (
                            <button onPointerDown={startDrag(key)} onPointerMove={onDragMove} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label={t('mpl_reorder')} className="p-1.5 -ml-1 shrink-0 text-gray-400 hover:text-brand-600 touch-none select-none cursor-grab active:cursor-grabbing">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="16" x2="20" y2="16" /></svg>
                            </button>
                          )}
                          {reorder
                            ? <div className="flex-1 min-w-0 flex items-center gap-2 select-none">{trackInner(h)}</div>
                            : trackOpen(h)}
                          {!reorder && (
                            <>
                              <button onClick={() => toggleSaved(key, h.file)} disabled={!h.file && !star} aria-label={t('mp_saved')} className={'p-1.5 shrink-0 disabled:opacity-30 ' + (star ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500')}>
                                <svg viewBox="0 0 24 24" fill={star ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg>
                              </button>
                              <button onClick={() => removeItem(key)} aria-label="delete" className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><ToolIcon name="x" className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              ) : openGroup === null ? (
                /* ---- 리스트: group list (즐겨찾기 first, custom groups, then + 새 그룹 at the bottom) ---- */
                <div className={'divide-y ' + (darkMode ? 'divide-white/10' : 'divide-gray-100')}>
                  {/* 즐겨찾기 — fixed, can't be deleted */}
                  <button onClick={() => { setOpenGroup('fav'); setAddMode(false); setReorder(false) }} className={'w-full flex items-center gap-2 px-3 py-2.5 text-left ' + (darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')}>
                    <span className={'w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-amber-500 ' + (darkMode ? 'bg-amber-500/15' : 'bg-amber-50')}><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg></span>
                    <span className={'flex-1 min-w-0 text-sm font-medium truncate ' + (darkMode ? 'text-gray-100' : 'text-gray-800')}>{t('mpl_fav')}</span>
                    <span className={'text-xs tabular-nums ' + (darkMode ? 'text-gray-400' : 'text-gray-400')}>{savedCount}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-4 h-4 ' + (darkMode ? 'text-gray-500' : 'text-gray-300')}><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                  {/* custom groups (delete now lives inside the playlist, next to "add tracks") */}
                  {groups.map((g) => (
                    <button key={g.id} onClick={() => { setOpenGroup(g.id); setAddMode(false); setReorder(false) }} className={'w-full flex items-center gap-2 px-3 py-2.5 text-left ' + (darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')}>
                      <span className={'w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-gray-400 ' + (darkMode ? 'bg-gray-800' : 'bg-gray-100')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></span>
                      <span className={'flex-1 min-w-0 text-sm font-medium truncate ' + (darkMode ? 'text-gray-100' : 'text-gray-800')}>{g.name}</span>
                      <span className="text-xs text-gray-400 tabular-nums">{groupSongs(g.id).length}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-4 h-4 ' + (darkMode ? 'text-gray-500' : 'text-gray-300')}><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  ))}
                  {/* + 새 그룹 — at the bottom */}
                  <div className="p-2">
                    {creating ? (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                        <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') createGroup(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }} placeholder={t('mpl_group_ph')} className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                        <button onClick={createGroup} className="px-3 py-1.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700">{t('mpl_create')}</button>
                        <button onClick={() => { setCreating(false); setNewName('') }} aria-label="cancel" className="p-1.5 text-gray-400 hover:text-gray-600"><ToolIcon name="x" className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setCreating(true)} className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg"><ToolIcon name="plus" className="w-4 h-4" />{t('mpl_newgroup')}</button>
                    )}
                  </div>
                </div>
              ) : (
                /* ---- 리스트: one group (drill-in) ---- */
                <div>
                  <div className={'flex items-center gap-1 px-2 py-2 border-b ' + (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100')}>
                    <button onClick={() => { setOpenGroup(null); setAddMode(false); setReorder(false) }} className={'inline-flex items-center gap-1 px-1.5 py-1 text-sm ' + (darkMode ? 'text-gray-400 hover:text-brand-400' : 'text-gray-500 hover:text-brand-600')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6" /></svg>{t('mpl_back')}</button>
                    <span className={'flex-1 min-w-0 text-sm font-semibold truncate text-center ' + (darkMode ? 'text-gray-100' : 'text-gray-800')}>{groupName(openGroup)}</span>
                    {/* ≡ reorder tracks within this playlist (drag handles appear on the rows) */}
                    {!addMode && groupSongs(openGroup).length > 1 && (
                      <button onClick={() => setReorder((r) => !r)} aria-label={t('mpl_reorder')} title={t('mpl_reorder')} className={'p-1.5 rounded transition-colors ' + (reorder ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:text-brand-600')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
                      </button>
                    )}
                    {!reorder && <button onClick={() => { setAddMode((a) => !a); setRenderN(80) }} className={'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ' + (addMode ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50')}>{addMode ? t('mpl_done') : <><ToolIcon name="plus" className="w-3.5 h-3.5" />{t('mpl_addsongs')}</>}</button>}
                    {/* Delete this playlist (only for custom ones; 즐겨찾기 can't be deleted) */}
                    {!reorder && !addMode && openGroup !== 'fav' && <button onClick={() => { const g = groups.find((x) => x.id === openGroup); if (g && window.confirm(t('mpl_del_confirm', { name: g.name }))) deleteGroup(g.id) }} aria-label="delete group" className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><ToolIcon name="trash" className="w-4 h-4" /></button>}
                  </div>
                  {addMode ? (
                    /* pick which tracks belong to this group */
                    history.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-10">{t('mp_empty')}</p>
                    ) : (
                      <div onScroll={onListScroll} className="divide-y divide-gray-100 max-h-80 overflow-auto">
                        {history.slice(0, renderN).map((h) => {
                          const key = h.name + '|' + h.size; const member = groupKeys(openGroup).has(key)
                          return (
                            <button key={key} onClick={() => inGroup(openGroup, key, h.file)} className={'w-full flex items-center gap-2 px-3 py-2.5 text-left ' + (darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')}>
                              <span className={'w-5 h-5 shrink-0 rounded border inline-flex items-center justify-center ' + (member ? 'bg-brand-600 border-brand-600 text-white' : darkMode ? 'border-gray-600' : 'border-gray-300')}>{member && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M20 6 9 17l-5-5" /></svg>}</span>
                              <span className={'flex-1 min-w-0 text-sm truncate ' + (darkMode ? 'text-gray-100' : 'text-gray-800')}>{h.name.replace(/\.[^.]+$/, '')}</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  ) : (
                    groupSongs(openGroup).length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-10">{t('mpl_group_empty')}</p>
                    ) : (
                      <div ref={groupListRef} onScroll={onListScroll} className={'max-h-[300px] overflow-y-auto divide-y ' + (darkMode ? 'divide-white/10' : 'divide-gray-100')}>
                        {groupSongs(openGroup).slice(0, renderN).map((h) => {
                          const key = h.name + '|' + h.size; const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
                          return (
                            <div key={key} data-key={key} className={'flex items-center gap-2 px-3 py-2.5 transition-colors ' + (dragKey === key ? 'bg-brand-100 shadow-inner' : isCur ? (darkMode ? 'bg-white/15' : 'bg-brand-50') : '')}>
                              {reorder && (
                                <button onPointerDown={startDrag(key)} onPointerMove={onGroupDragMove} onPointerUp={endGroupDrag} onPointerCancel={endGroupDrag} aria-label={t('mpl_reorder')} className="p-1.5 -ml-1 shrink-0 text-gray-400 hover:text-brand-600 touch-none select-none cursor-grab active:cursor-grabbing">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="16" x2="20" y2="16" /></svg>
                                </button>
                              )}
                              {reorder
                                ? <div className="flex-1 min-w-0 flex items-center gap-2 select-none">{trackInner(h)}</div>
                                : trackOpen(h)}
                              {!reorder && <button onClick={() => inGroup(openGroup, key, h.file)} aria-label={t('mpl_remove')} title={t('mpl_remove')} className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="9" /><line x1="8" y1="12" x2="16" y2="12" /></svg></button>}
                            </div>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Long-press action menu: play · favorite · add to a new list · delete. */}
        {menuFor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 select-none" onClick={closeMenu}>
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden select-none" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate">{menuFor.name.replace(/\.[^.]+$/, '')}</span>
                <button onClick={closeMenu} aria-label="close" className="p-1 -mr-1 text-gray-400 hover:text-gray-600"><ToolIcon name="x" className="w-4 h-4" /></button>
              </div>
              {menuCreating ? (
                <div className="p-3 flex items-center gap-2">
                  {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                  <input autoFocus value={menuNewName} onChange={(e) => setMenuNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') createFromMenu(); if (e.key === 'Escape') { setMenuCreating(false); setMenuNewName('') } }} placeholder={t('mpl_group_ph')} className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                  <button onClick={createFromMenu} className="px-3 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700">{t('mpl_create')}</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {/* 1 · 플레이 하기 */}
                  <button onClick={() => { if (menuFor.file) { load(menuFor.file); cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } closeMenu() }} disabled={!menuFor.file} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-40">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-brand-600"><path d="M8 5v14l11-7z" /></svg>{t('mpl_m_play')}
                  </button>
                  {/* 2 · 즐겨찾기에 추가/빼기 */}
                  <button onClick={() => inGroup('fav', menuFor.key, menuFor.file)} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50">
                    <svg viewBox="0 0 24 24" fill={saved.has(menuFor.key) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 text-amber-500"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg>{saved.has(menuFor.key) ? t('mpl_m_unfav') : t('mpl_m_fav')}
                  </button>
                  {/* existing playlists → toggle membership */}
                  {groups.map((g) => {
                    const inIt = g.keys.includes(menuFor.key)
                    return (
                      <button key={g.id} onClick={() => toggleInGroup(g.id, menuFor.key, menuFor.file)} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-5 h-5 shrink-0 ' + (inIt ? 'text-brand-600' : 'text-gray-400')}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg><span className="flex-1 min-w-0 truncate">{t(inIt ? 'mpl_m_removefrom' : 'mpl_m_addto', { name: g.name })}</span>
                      </button>
                    )
                  })}
                  {/* 3 · 새 리스트에 추가하기 */}
                  <button onClick={() => setMenuCreating(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 text-brand-600"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{t('mpl_m_newlist')}
                  </button>
                  {/* 4 · 삭제하기 */}
                  <button onClick={() => { removeItem(menuFor.key); closeMenu() }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">
                    <ToolIcon name="trash" className="w-5 h-5 shrink-0" />{t('mpl_m_delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings modal: equalizer · dark mode · auto album art. */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowSettings(false)}>
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="flex-1 text-sm font-semibold text-gray-800">{t('mpl_settings')}</span>
                <button onClick={() => setShowSettings(false)} aria-label="close" className="p-1 -mr-1 text-gray-400 hover:text-gray-600"><ToolIcon name="x" className="w-4 h-4" /></button>
              </div>
              <div className="divide-y divide-gray-100">
                {([[t('mpl_autosave_opt'), autoSave, toggleAutoSave], [t('mpl_eq_opt'), eqEnabled, toggleEq], [t('mpl_dark_opt'), darkMode, toggleDark], [t('mpl_art_opt'), albumArt, toggleArt], [t('mpl_lyrics_opt'), lyricsOn, toggleLyrics]] as [string, boolean, () => void][]).map(([label, on, toggle], i) => (
                  <label key={i} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
                    <span className="flex-1 min-w-0 text-sm text-gray-800">{label}</span>
                    <button onClick={toggle} role="switch" aria-checked={on} aria-label={label} className={'relative shrink-0 w-11 h-6 rounded-full transition ' + (on ? 'bg-brand-600' : 'bg-gray-300')}>
                      <span className={'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ' + (on ? 'left-[22px]' : 'left-0.5')} />
                    </button>
                  </label>
                ))}
                {/* Storage used (whole origin) — helps the user understand the auto-save cache */}
                {usage && usage.usage > 0 && <p className="px-4 py-2 text-xs text-gray-400">{t('mpl_storage', { used: fmtSize(usage.usage), total: usage.quota ? fmtSize(usage.quota) : '—' })}</p>}
                {/* Drop cached audio but keep the list (rows dim, space freed) */}
                <button onClick={() => { if (window.confirm(t('mpl_drop_confirm'))) { mhDropBlobs().then(() => mhStorageUsage().then(setUsage)); setHistory((h) => h.map((x) => (saved.has(x.name + '|' + x.size) ? x : { ...x, file: null }))) } }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-gray-700 hover:bg-gray-50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0"><path d="M21 12a9 9 0 1 1-6.2-8.5" /><path d="M21 3v6h-6" /></svg>{t('mpl_drop_cache')}
                </button>
                {/* Clear the whole file list (moved here from the header trash button) */}
                <button onClick={() => { if (allCount > 0 && window.confirm(t('mpl_clear_confirm'))) { clearAll(); setShowSettings(false) } }} disabled={allCount === 0} className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-40">
                  <ToolIcon name="trash" className="w-5 h-5 shrink-0" />{t('mpl_clear_list')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ★ popup: add the currently-playing track to a playlist (즐겨찾기 first), or make a new one. */}
        {starMenu && curFile && (() => {
          const curKey = curFile.name + '|' + curFile.size
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={closeStar}>
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate">{dispTitle}</span>
                  <button onClick={closeStar} aria-label="close" className="p-1 -mr-1 text-gray-400 hover:text-gray-600"><ToolIcon name="x" className="w-4 h-4" /></button>
                </div>
                <div className="max-h-72 overflow-auto divide-y divide-gray-100">
                  {[{ id: 'fav', name: t('mpl_fav') }, ...groups].map((g) => {
                    const member = (g.id === 'fav' ? saved.has(curKey) : (groups.find((x) => x.id === g.id)?.keys.includes(curKey) ?? false))
                    return (
                      <button key={g.id} onClick={() => inGroup(g.id, curKey, curFile)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50">
                        <span className={'w-5 h-5 shrink-0 rounded border inline-flex items-center justify-center ' + (member ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-300')}>{member && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M20 6 9 17l-5-5" /></svg>}</span>
                        {g.id === 'fav'
                          ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-amber-500"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-400"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>}
                        <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{g.name}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="border-t border-gray-100 p-2">
                  {menuCreating ? (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                      <input autoFocus value={menuNewName} onChange={(e) => setMenuNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') createForCurrent(); if (e.key === 'Escape') { setMenuCreating(false); setMenuNewName('') } }} placeholder={t('mpl_group_ph')} className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                      <button onClick={createForCurrent} className="px-3 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700">{t('mpl_create')}</button>
                    </div>
                  ) : (
                    <button onClick={() => setMenuCreating(true)} className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg"><ToolIcon name="plus" className="w-4 h-4" />{t('mpl_newlist')}</button>
                  )}
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </ToolLayout>
  )
}
