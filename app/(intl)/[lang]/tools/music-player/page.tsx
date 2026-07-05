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
const fmt = (s: number) => { if (!isFinite(s) || s < 0) s = 0; const m = Math.floor(s / 60); const ss = Math.floor(s % 60); return `${m}:${String(ss).padStart(2, '0')}` }
const fmtSize = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB')
const SPEEDS = [1, 1.25, 1.5, 2, 0.75]
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

  const audioRef = useRef<HTMLAudioElement>(null)
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
    if (!isAudio(f)) return
    setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) })
    setBase(f.name.replace(/\.[^.]+$/, '') || f.name)
    setCur(0)
    resumePosRef.current = positionsRef.current[f.name + '|' + f.size] || 0
    setCurFile(f)
    if (!advance) setHistory((h) => [{ name: f.name, size: f.size, file: f }, ...h.filter((x) => !(x.name === f.name && x.size === f.size))].slice(0, 100))
    const id = f.name + '|' + f.size
    const meta = { id, name: f.name, size: f.size, type: f.type }
    if (savedRef.current.has(id)) mhSave(meta, f); else mhPutMeta(meta)
    trackToolUsed('music-player')
  }, [])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  // Playlist filtered by the open tab; next/prev cycle it (skipping metadata-only entries with no blob).
  const shown = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
  function playNext() {
    const list = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
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
    const list = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
    if (!list.length) return
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : 0
    for (let step = 1; step <= list.length; step++) { const p = list[(idx - step + list.length) % list.length]; if (p?.file) { load(p.file, true); return } }
  }

  const media = () => audioRef.current
  const togglePlay = () => { const a = media(); if (!a || !url) return; if (a.paused) a.play().catch(() => {}); else a.pause() }
  const seekTo = (time: number) => { const a = media(); if (a) a.currentTime = time }
  const setVol = (v: number) => { const a = media(); if (a) a.volume = v; setVolume(v) }
  const cycleSpeed = () => { const i = SPEEDS.indexOf(speed); setSpeed(SPEEDS[(i + 1) % SPEEDS.length]) }

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
    mhDelete(key)
  }
  const clearAll = () => { setHistory([]); setSaved(new Set()); setCurFile(null); setUrl((u) => { if (u) URL.revokeObjectURL(u); return '' }); setBase(''); setPlaying(false); try { localStorage.removeItem('mp_saved_v1') } catch { /* ignore */ } mhClear() }

  // ---- file inputs / drag-drop ----
  const addFiles = useCallback((list: FileList | File[] | null) => {
    const files = Array.from(list || []).filter(isAudio)
    if (!files.length) return
    setHistory((h) => { const seen = new Set(h.map((x) => x.name + '|' + x.size)); const add = files.filter((f) => !seen.has(f.name + '|' + f.size)).map((f) => ({ name: f.name, size: f.size, file: f })); return [...add, ...h].slice(0, 100) })
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

  const REPEATS: ('all' | 'one' | 'off')[] = ['all', 'one', 'off']
  const cycleRepeat = () => setRepeatMode((m) => (m === 'shuffle' ? 'all' : REPEATS[(REPEATS.indexOf(m as 'all') + 1) % REPEATS.length]))

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4 max-w-lg mx-auto">
        <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <input ref={dirRef} type="file" {...({ webkitdirectory: '', directory: '' } as any)} className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
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
          onTimeUpdate={(e) => {
            const a = e.currentTarget; setCur(a.currentTime); savePos(a.currentTime)
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const ms = (navigator as any).mediaSession
            if (ms?.setPositionState && a.duration && isFinite(a.duration)) { try { ms.setPositionState({ duration: a.duration, position: Math.min(a.currentTime, a.duration), playbackRate: a.playbackRate || 1 }) } catch { /* ignore */ } }
          }} />

        {history.length === 0 && !curFile ? (
          /* ---- empty: drop zone ---- */
          <div onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 mx-auto text-gray-400"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
            <p className="text-sm font-medium text-gray-600 mt-3">{t('mp_drop')}</p>
            <div className="flex justify-center gap-2 mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700"><ToolIcon name="plus" className="w-4 h-4" />{t('mp_pick')}</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200"><ToolIcon name="folder" className="w-4 h-4" />{t('mp_folder')}</button>
            </div>
          </div>
        ) : (
          <>
            {/* ---- Now-playing card ---- */}
            <div className="rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 p-5 text-white shadow-sm">
              <div className="aspect-square max-h-56 mx-auto flex items-center justify-center rounded-2xl bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 opacity-90"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
              </div>
              <p className="mt-4 text-center font-semibold truncate">{base || t('mp_nothing')}</p>
              {/* seek */}
              <input type="range" min={0} max={dur || 0} step={0.1} value={Math.min(cur, dur || 0)} onChange={(e) => seekTo(+e.target.value)} aria-label="seek"
                className="w-full mt-4 h-1.5 accent-white cursor-pointer" disabled={!url} />
              <div className="flex justify-between text-xs font-mono text-white/80"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
              {/* transport */}
              <div className="flex items-center justify-center gap-4 mt-3 text-white">
                <button onClick={() => setRepeatMode((m) => (m === 'shuffle' ? 'all' : 'shuffle'))} aria-label={t('mp_shuffle')} title={t('mp_shuffle')} className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (repeatMode === 'shuffle' ? 'bg-white/25' : 'hover:bg-white/15')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></svg>
                </button>
                <button onClick={playPrev} aria-label="previous" className="w-12 h-12 inline-flex items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 20 9 12l10-8z" /><rect x="4" y="4" width="2.4" height="16" rx="1" /></svg></button>
                <button onClick={togglePlay} aria-label="play" className="w-16 h-16 inline-flex items-center justify-center rounded-full bg-white text-brand-700 hover:bg-white/90 active:scale-95 transition shadow">
                  {playing ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5v14l11-7z" /></svg>}
                </button>
                <button onClick={playNext} aria-label="next" className="w-12 h-12 inline-flex items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="m5 4 10 8-10 8z" /><rect x="17.6" y="4" width="2.4" height="16" rx="1" /></svg></button>
                <button onClick={cycleRepeat} aria-label={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} title={t(repeatMode === 'one' ? 'mp_repeat_one' : repeatMode === 'off' ? 'mp_repeat_off' : 'mp_repeat_all')} className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:scale-95 transition ' + (repeatMode === 'one' || repeatMode === 'all' ? 'bg-white/25' : 'hover:bg-white/15')}>
                  <span className="relative inline-flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12a10 10 0 0 1 17-7" /><path d="M22 12a10 10 0 0 1-17 7" /><path d="m19 2 .5 3.3-3.3.5" /><path d="m5 22-.5-3.3 3.3-.5" /></svg>{repeatMode === 'one' && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">1</span>}</span>
                </button>
              </div>
              {/* volume + speed + timer */}
              <div className="flex items-center gap-3 mt-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-white/80"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVol(+e.target.value)} aria-label="volume" className="flex-1 h-1.5 accent-white cursor-pointer" />
                <button onClick={cycleSpeed} title={t('mp_speed')} className="text-xs font-bold tabular-nums bg-white/15 hover:bg-white/25 rounded-lg px-2 py-1">{speed}×</button>
                <select value={sleepMin} onChange={(e) => setSleepMin(+e.target.value)} aria-label={t('mp_timer')} className="text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-lg px-1.5 py-1 outline-none [&>option]:text-gray-800">
                  <option value={0}>⏱ {sleepMin ? `${Math.floor(sleepLeft / 60)}:${String(sleepLeft % 60).padStart(2, '0')}` : t('mp_timer_off')}</option>
                  {TIMER_MENU.map((m) => <option key={m} value={m}>{t('ct_min', { n: m })}</option>)}
                </select>
              </div>
            </div>

            {/* ---- Playlist (standard list style) ---- */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-1 bg-gray-50 px-2 border-b border-gray-200">
                {(['all', 'saved'] as const).map((tab) => (
                  <button key={tab} onClick={() => setHistTab(tab)} className={'px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ' + (histTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>{t(tab === 'all' ? 'mp_all' : 'mp_saved')}</button>
                ))}
                <span className="ml-auto pr-1 text-xs text-gray-400">{shown.length}</span>
                <button onClick={() => inputRef.current?.click()} title={t('mp_pick')} className="p-2 text-gray-400 hover:text-brand-600"><ToolIcon name="plus" className="w-4 h-4" /></button>
                <button onClick={clearAll} title={t('mp_reset')} className="p-2 text-gray-400 hover:text-red-600"><ToolIcon name="trash" className="w-4 h-4" /></button>
              </div>
              {shown.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">{t('mp_empty')}</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {shown.map((h) => {
                    const key = h.name + '|' + h.size
                    const isCur = curFile ? curFile.name + '|' + curFile.size === key : false
                    const star = saved.has(key)
                    return (
                      <div key={key} className={'flex items-center gap-2 px-3 py-2.5 ' + (isCur ? 'bg-brand-50' : '')}>
                        <button onClick={() => (h.file ? load(h.file) : inputRef.current?.click())} className="flex-1 min-w-0 flex items-center gap-2 text-left" title={h.file ? '' : t('mp_reopen')}>
                          <span className={'w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg ' + (isCur && playing ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400')}>
                            {isCur && playing ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z" /></svg>}
                          </span>
                          <span className="min-w-0">
                            <span className={'block truncate text-sm ' + (isCur ? 'font-semibold text-brand-700' : 'text-gray-800') + (h.file ? '' : ' opacity-50')}>{h.name.replace(/\.[^.]+$/, '')}</span>
                            <span className="block text-[11px] text-gray-400">{h.file ? fmtSize(h.size) : t('mp_reopen')}</span>
                          </span>
                        </button>
                        <button onClick={() => toggleSaved(key, h.file)} disabled={!h.file && !star} aria-label={t('mp_saved')} className={'p-1.5 shrink-0 disabled:opacity-30 ' + (star ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500')}>
                          <svg viewBox="0 0 24 24" fill={star ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 17.3 6.2 20l1.1-6.4L2.6 9l6.4-.9L12 2.3l3 5.8 6.4.9-4.7 4.6 1.1 6.4z" /></svg>
                        </button>
                        <button onClick={() => removeItem(key)} aria-label="delete" className="p-1.5 shrink-0 text-gray-300 hover:text-red-600"><ToolIcon name="x" className="w-4 h-4" /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
