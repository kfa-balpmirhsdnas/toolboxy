'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'
import { mhList, mhPutMeta, mhPutManyMeta, mhSave, mhSetBlob, mhDelete, mhClear } from '@/lib/tools/musicHistory'

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
  const [reorder, setReorder] = useState(false) // playlist reorder mode (drag handle per row)
  const [dragKey, setDragKey] = useState<string | null>(null) // row currently being dragged
  // ---- groups (the 리스트/플레이리스트 tab) ----
  const [groups, setGroups] = useState<{ id: string; name: string; keys: string[] }[]>([]) // custom groups
  const [openGroup, setOpenGroup] = useState<string | null>(null) // null=group list · 'fav'=즐겨찾기 · else group id
  const [creating, setCreating] = useState(false) // inline "new group" input open
  const [newName, setNewName] = useState('')
  const [addMode, setAddMode] = useState(false) // group detail: pick songs to add/remove

  const audioRef = useRef<HTMLAudioElement>(null)
  const groupsRef = useRef(groups)
  useEffect(() => { groupsRef.current = groups }, [groups])
  const dragKeyRef = useRef<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null) // now-playing card — scroll target on track click
  const inputRef = useRef<HTMLInputElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)
  const positionsRef = useRef<Record<string, number>>({})
  const resumePosRef = useRef(0)
  const posSaveTsRef = useRef(0)
  const sleepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const savedRef = useRef<Set<string>>(new Set())
  useEffect(() => { savedRef.current = saved }, [saved])

  // ---- persistence: resume positions + starred set + restored list ----
  useEffect(() => { try { const s = localStorage.getItem('mp_pos_v1'); if (s) positionsRef.current = JSON.parse(s) } catch { /* ignore */ } }, [])
  useEffect(() => { try { const s = localStorage.getItem('mp_saved_v1'); if (s) setSaved(new Set(JSON.parse(s))) } catch { /* ignore */ } }, [])
  useEffect(() => { try { const s = localStorage.getItem('mp_groups_v1'); if (s) setGroups(JSON.parse(s)) } catch { /* ignore */ } }, [])
  useEffect(() => {
    let alive = true
    mhList().then((items) => {
      if (!alive || !items.length) return
      const restored = items.map((it) => ({ name: it.name, size: it.size, file: it.blob ? new File([it.blob], it.name, { type: it.type }) : null }))
      setHistory((h) => { const seen = new Set(h.map((x) => x.name + '|' + x.size)); return [...h, ...restored.filter((r) => !seen.has(r.name + '|' + r.size))].slice(0, 100) })
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
        : [{ name: f.name, size: f.size, file: f }, ...h].slice(0, 100))
      const id = f.name + '|' + f.size
      const meta = { id, name: f.name, size: f.size, type: f.type }
      if (savedRef.current.has(id)) mhSave(meta, f); else mhPutMeta(meta)
      trackToolUsed('music-player')
    } catch (e) { setNotice({ msg: `load: ${(e as Error)?.message || e}`, err: true }) }
  }, [])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  // Playlist filtered by the open tab; next/prev cycle it (skipping metadata-only entries with no blob).
  const shown = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
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
    if (!list.length) return
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
    if (!list.length) return
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : 0
    for (let step = 1; step <= list.length; step++) { const p = list[(idx - step + list.length) % list.length]; if (p?.file) { load(p.file, true); return } }
  }

  const media = () => audioRef.current
  const togglePlay = () => { const a = media(); if (!a || !url) return; if (a.paused) a.play().catch(() => {}); else a.pause() }
  const seekTo = (time: number) => { const a = media(); if (a) a.currentTime = time }
  const seekBy = (d: number) => { const a = media(); if (a) a.currentTime = Math.max(0, Math.min(a.duration || a.currentTime, a.currentTime + d)) }
  const setVol = (v: number) => { const a = media(); if (a) a.volume = v; setVolume(v) }

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
  // Songs of a group, in playlist order (즐겨찾기 = the ★ set).
  const groupKeys = (id: string) => (id === 'fav' ? saved : new Set(groups.find((g) => g.id === id)?.keys || []))
  const groupSongs = (id: string) => { const ks = groupKeys(id); return history.filter((h) => ks.has(h.name + '|' + h.size)) }
  const groupName = (id: string) => (id === 'fav' ? t('mpl_fav') : groups.find((g) => g.id === id)?.name || '')
  const inGroup = (id: string, key: string, file: File | null) => (id === 'fav' ? toggleSaved(key, file) : toggleInGroup(id, key, file))

  // Shared row content (play icon + name/size) reused by the 전체 list and the group views.
  const trackInner = (h: { name: string; size: number; file: File | null }) => {
    const key = h.name + '|' + h.size
    const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
    return (
      <>
        <span className={'w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg ' + (isCur && playing ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400')}>
          {isCur && playing ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z" /></svg>}
        </span>
        <span className="min-w-0">
          <span className={'block truncate text-sm ' + (isCur ? 'font-semibold text-brand-700' : 'text-gray-800') + (h.file ? '' : ' opacity-50')}>{h.name.replace(/\.[^.]+$/, '')}</span>
          <span className="block text-[11px] text-gray-400">{h.file ? fmtSize(h.size) : t('mp_reopen')}</span>
        </span>
      </>
    )
  }
  // Clickable play/label wrapper: load the track + scroll to the card (dimmed track → re-open folder).
  const trackOpen = (h: { name: string; size: number; file: File | null }) => h.file
    ? <button onClick={() => { load(h.file!); cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="flex-1 min-w-0 flex items-center gap-2 text-left">{trackInner(h)}</button>
    : <label htmlFor="mp-folder" title={t('mp_reopen')} className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer">{trackInner(h)}</label>

  const clearAll = () => { setHistory([]); setSaved(new Set()); setCurFile(null); setUrl((u) => { if (u) URL.revokeObjectURL(u); return '' }); setBase(''); setPlaying(false); try { localStorage.removeItem('mp_saved_v1') } catch { /* ignore */ } mhClear() }

  // ---- file inputs / drag-drop ----
  const addFiles = useCallback((list: FileList | File[] | null, trusted = false) => {
    // The audio picker (accept="audio/*") already limits the OS to audio, so trust its selection even
    // when a mobile media picker returns a blank MIME type / a name without extension. Folders and
    // drag-drop can include anything, so those still filter to audio.
    const all = Array.from(list || [])
    const files = trusted ? all : all.filter(maybeAudio)
    if (!files.length) return
    setHistory((h) => {
      // Re-attach the real blob to any metadata-only (dimmed) entry the folder re-supplies, so it turns playable.
      const byKey = new Map(files.map((f) => [f.name + '|' + f.size, f] as const))
      const merged = h.map((x) => { const f = byKey.get(x.name + '|' + x.size); return f && !x.file ? { name: x.name, size: x.size, file: f } : x })
      const seen = new Set(h.map((x) => x.name + '|' + x.size))
      const add = files.filter((f) => !seen.has(f.name + '|' + f.size)).map((f) => ({ name: f.name, size: f.size, file: f }))
      return [...add, ...merged].slice(0, 100)
    })
    mhPutManyMeta(files.map((f) => ({ id: f.name + '|' + f.size, name: f.name, size: f.size, type: f.type })))
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
    sleepRef.current = setInterval(() => { left -= 1; setSleepLeft(left); if (left <= 0) { audioRef.current?.pause(); if (sleepRef.current) clearInterval(sleepRef.current); sleepRef.current = null; setSleepMin(0) } }, 1000)
    return () => { if (sleepRef.current) clearInterval(sleepRef.current) }
  }, [sleepMin])

  // ---- MediaSession: lock-screen controls + background playback ----
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ms = typeof navigator !== 'undefined' ? (navigator as any).mediaSession : null
    if (!ms) return
    if (!url) { try { ms.metadata = null } catch { /* ignore */ } return }
    try { const MM = (window as any).MediaMetadata; if (MM) ms.metadata = new MM({ title: base, artist: 'ToolBoxy', artwork: [{ src: '/icons/music-player.png', sizes: '512x512', type: 'image/png' }] }) } catch { /* ignore */ }
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
  }, [url, base])

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

        {/* On-screen diagnostic — surfaces the real reason a pick/load failed instead of failing silently. */}
        {notice && (
          <div className={'flex items-start gap-2 rounded-xl px-3 py-2 text-xs break-all ' + (notice.err ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600')}>
            <span className="flex-1 font-mono leading-relaxed">{notice.msg}</span>
            <button onClick={() => setNotice(null)} aria-label="dismiss" className="shrink-0 text-current opacity-60 hover:opacity-100"><ToolIcon name="x" className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {history.length === 0 && !curFile ? (
          /* ---- empty: drop zone ---- */
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 mx-auto text-gray-400"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
            <p className="text-sm font-medium text-gray-600 mt-3">{t('mpl_drop')}</p>
            <div className="flex justify-center gap-2 mt-4">
              {/* Native <label htmlFor> — a tap triggers the input directly (works even where a programmatic
                  .click() is ignored). 폴더 열기 is primary: it opens the real file browser on every browser
                  (some, e.g. Samsung Internet, force a camera/recorder chooser for an audio file input). */}
              <label htmlFor="mp-folder" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 cursor-pointer"><ToolIcon name="folder" className="w-4 h-4" />{t('mp_folder')}</label>
              <label htmlFor="mp-file" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 cursor-pointer"><ToolIcon name="plus" className="w-4 h-4" />{t('mp_pick')}</label>
            </div>
            <p className="text-xs text-gray-400 mt-3">{t('mpl_tip')}</p>
          </div>
        ) : (
          <>
            {/* ---- Now-playing card ---- */}
            <div ref={cardRef} className="rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-sm overflow-hidden scroll-mt-16">
              <div className="p-5">
              {/* Album art shrinks while a bottom gauge is open so the gauge fits without growing the card. */}
              <div className={'aspect-square mx-auto flex items-center justify-center rounded-2xl bg-white/10 ' + (panel === 'none' ? 'max-h-56' : 'max-h-36')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 opacity-90"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
              </div>
              <p className="mt-4 text-center font-semibold truncate">{base || t('mp_nothing')}</p>
              {/* seek */}
              <input type="range" min={0} max={dur || 0} step={0.1} value={Math.min(cur, dur || 0)} onChange={(e) => seekTo(+e.target.value)} aria-label="seek"
                className="w-full mt-4 h-1.5 accent-white cursor-pointer" disabled={!url} />
              <div className="flex justify-between text-xs font-mono text-white/80"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
              {/* transport */}
              <div className="flex items-center justify-center gap-4 mt-3 text-white">
                <button onClick={playPrev} aria-label="previous" className="w-12 h-12 inline-flex items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 20 9 12l10-8z" /><rect x="4" y="4" width="2.4" height="16" rx="1" /></svg></button>
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
                <button onClick={playNext} aria-label="next" className="w-12 h-12 inline-flex items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="m5 4 10 8-10 8z" /><rect x="17.6" y="4" width="2.4" height="16" rx="1" /></svg></button>
                <button onClick={cycleRepeat} aria-label={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'shuffle' ? 'mp_shuffle' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} title={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'shuffle' ? 'mp_shuffle' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (repeatMode !== 'off' ? 'bg-white/25' : 'hover:bg-white/15')}>
                  {repeatMode === 'shuffle'
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></svg>
                    : <span className="relative inline-flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12a10 10 0 0 1 17-7" /><path d="M22 12a10 10 0 0 1-17 7" /><path d="m19 2 .5 3.3-3.3.5" /><path d="m5 22-.5-3.3 3.3-.5" /></svg>{(repeatMode === 'one' || repeatMode === 'all') && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{repeatMode === 'all' ? 'A' : '1'}</span>}</span>}
                </button>
              </div>
              {/* seek row — −30/−10/−5 · +5/+10/+30 (same as the video player) */}
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
              </div>{/* end padded content */}
              {/* gauge slot — fixed height (= the album-art shrink) so opening a gauge never resizes the card */}
              {panel !== 'none' && (
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
                </div>
              )}
              {/* bottom bar — 소리 / 속도 / 타이머 icon buttons, flat-bottomed and flush to the card edge */}
              <div className="flex border-t border-white/15 text-white">
                <button onClick={() => setPanel((p) => (p === 'vol' ? 'none' : 'vol'))} aria-label={t('mpl_vol')} title={t('mpl_vol')} className={'flex-1 inline-flex items-center justify-center py-3.5 active:opacity-80 transition ' + (panel === 'vol' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">{volume === 0 ? <><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></> : <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" /></>}</svg>
                </button>
                <button onClick={() => setPanel((p) => (p === 'speed' ? 'none' : 'speed'))} aria-label={t('mp_speed')} title={`${t('mp_speed')} ${speed}×`} className={'flex-1 inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition ' + (panel === 'speed' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <span className="text-sm font-bold tabular-nums leading-none">{speed}×</span>
                </button>
                <button onClick={() => setPanel((p) => (p === 'timer' ? 'none' : 'timer'))} aria-label={t('mp_timer')} title={t('mp_timer')} className={'flex-1 relative inline-flex items-center justify-center py-3.5 border-l border-white/15 active:opacity-80 transition ' + (sleepMin || panel === 'timer' ? 'bg-white/20' : 'hover:bg-white/10')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></svg>
                  {sleepMin > 0 && <span className="absolute top-1 right-1/2 translate-x-[24px] text-[9px] font-mono font-bold tabular-nums leading-none">{Math.floor(sleepLeft / 60)}:{String(sleepLeft % 60).padStart(2, '0')}</span>}
                </button>
              </div>
            </div>

            {/* ---- Playlist (standard list style) ---- */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-1 bg-gray-50 px-2 border-b border-gray-200">
                {/* Reorder toggle (≡): tap to move tracks up/down in the list */}
                <button onClick={() => { setHistTab('all'); setReorder((r) => !r) }} aria-label={t('mpl_reorder')} title={t('mpl_reorder')} className={'p-2 rounded transition-colors ' + (reorder ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:text-brand-600')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
                </button>
                {(['all', 'saved'] as const).map((tab) => (
                  <button key={tab} onClick={() => { setHistTab(tab); setOpenGroup(null); setAddMode(false); setCreating(false); setReorder(false) }} className={'inline-flex items-center gap-1 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ' + (histTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                    {tab === 'all'
                      ? t('mp_all')
                      : <><span className="sm:hidden">{t('mpl_list')}</span><span className="hidden sm:inline">{t('mpl_playlist')}</span></>}
                    <span className="text-xs font-normal opacity-60 tabular-nums">{tab === 'all' ? allCount : savedCount}</span>
                  </button>
                ))}
                <label htmlFor="mp-file" title={t('mp_pick')} className="ml-auto p-2 text-gray-400 hover:text-brand-600 cursor-pointer"><ToolIcon name="plus" className="w-4 h-4" /></label>
                <label htmlFor="mp-folder" title={t('mp_folder')} className="p-2 text-gray-400 hover:text-brand-600 cursor-pointer"><ToolIcon name="folder" className="w-4 h-4" /></label>
                <button onClick={clearAll} title={t('mp_reset')} className="p-2 text-gray-400 hover:text-red-600"><ToolIcon name="trash" className="w-4 h-4" /></button>
              </div>
              {histTab === 'all' ? (
                /* ---- 전체: every track (reorder · ★ · ✕) ---- */
                shown.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">{t('mp_empty')}</p>
                ) : (
                  <div ref={listRef} className="divide-y divide-gray-100">
                    {shown.map((h) => {
                      const key = h.name + '|' + h.size
                      const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
                      const star = saved.has(key)
                      return (
                        <div key={key} data-key={key} className={'flex items-center gap-2 px-3 py-2.5 transition-colors ' + (dragKey === key ? 'bg-brand-100 shadow-inner' : isCur ? 'bg-brand-50' : '')}>
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
                /* ---- 리스트: group list (즐겨찾기 fixed first, then custom groups) ---- */
                <div className="divide-y divide-gray-100">
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
                  {/* 즐겨찾기 — fixed, can't be deleted */}
                  <button onClick={() => { setOpenGroup('fav'); setAddMode(false) }} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50">
                    <span className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-amber-50 text-amber-500"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg></span>
                    <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 truncate">{t('mpl_fav')}</span>
                    <span className="text-xs text-gray-400 tabular-nums">{savedCount}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-300"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                  {/* custom groups */}
                  {groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
                      <button onClick={() => { setOpenGroup(g.id); setAddMode(false) }} className="flex-1 min-w-0 flex items-center gap-2 text-left">
                        <span className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></span>
                        <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 truncate">{g.name}</span>
                        <span className="text-xs text-gray-400 tabular-nums">{groupSongs(g.id).length}</span>
                      </button>
                      <button onClick={() => deleteGroup(g.id)} aria-label="delete group" className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><ToolIcon name="trash" className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                /* ---- 리스트: one group (drill-in) ---- */
                <div>
                  <div className="flex items-center gap-2 px-2 py-2 bg-gray-50 border-b border-gray-100">
                    <button onClick={() => { setOpenGroup(null); setAddMode(false) }} className="inline-flex items-center gap-1 px-1.5 py-1 text-sm text-gray-500 hover:text-brand-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6" /></svg>{t('mpl_back')}</button>
                    <span className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate text-center">{groupName(openGroup)}</span>
                    <button onClick={() => setAddMode((a) => !a)} className={'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ' + (addMode ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50')}>{addMode ? t('mpl_done') : <><ToolIcon name="plus" className="w-3.5 h-3.5" />{t('mpl_addsongs')}</>}</button>
                  </div>
                  {addMode ? (
                    /* pick which tracks belong to this group */
                    history.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-10">{t('mp_empty')}</p>
                    ) : (
                      <div className="divide-y divide-gray-100 max-h-80 overflow-auto">
                        {history.map((h) => {
                          const key = h.name + '|' + h.size; const member = groupKeys(openGroup).has(key)
                          return (
                            <button key={key} onClick={() => inGroup(openGroup, key, h.file)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50">
                              <span className={'w-5 h-5 shrink-0 rounded border inline-flex items-center justify-center ' + (member ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-300')}>{member && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M20 6 9 17l-5-5" /></svg>}</span>
                              <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{h.name.replace(/\.[^.]+$/, '')}</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  ) : (
                    groupSongs(openGroup).length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-10">{t('mpl_group_empty')}</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {groupSongs(openGroup).map((h) => {
                          const key = h.name + '|' + h.size; const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
                          return (
                            <div key={key} className={'flex items-center gap-2 px-3 py-2.5 ' + (isCur ? 'bg-brand-50' : '')}>
                              {trackOpen(h)}
                              <button onClick={() => inGroup(openGroup, key, h.file)} aria-label={t('mpl_remove')} title={t('mpl_remove')} className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="9" /><line x1="8" y1="12" x2="16" y2="12" /></svg></button>
                            </div>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
