'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('video-player')!
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
// Overlay submenu option sets.
const TIMER_MENU = [15, 30, 60, 120]
const SPEED_MENU = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
const ROTATE_MENU = [90, 180, 270, 350]
// mm:ss.d — a compact clock that also shows tenths (handy for A–B precision).
const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60), sec = Math.floor(s % 60), d = Math.floor((s * 10) % 10)
  return `${m}:${String(sec).padStart(2, '0')}.${d}`
}
// Filename-safe timestamp, e.g. 1m03s4.
const fmtFile = (s: number) => `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}s${Math.floor((s * 10) % 10)}`
const fmtSize = (b: number) => (b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB')

export default function VideoPlayerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}
  const [url, setUrl] = useState('')
  const [base, setBase] = useState('frame')
  const [dur, setDur] = useState(0)
  const [cur, setCur] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [a, setA] = useState<number | null>(null)
  const [b, setB] = useState<number | null>(null)
  const [repeat, setRepeat] = useState(false)
  const [capFmt, setCapFmt] = useState<'png' | 'jpg'>('png')
  const [captured, setCaptured] = useState(false)
  const [optTab, setOptTab] = useState<'frame' | 'ab' | 'speed'>('frame') // combined options tabs
  const [history, setHistory] = useState<{ name: string; size: number; file: File }[]>([]) // played videos (session)
  const [curFile, setCurFile] = useState<File | null>(null)
  // Overlay controls (on top of the video; the tab controls below stay as-is).
  const [rot, setRot] = useState(0)            // display rotation 0/90/180/270
  const [loopAll, setLoopAll] = useState(false) // whole-video loop
  const [sleepMin, setSleepMin] = useState(0)   // sleep-timer minutes (0 = off)
  const [sleepLeft, setSleepLeft] = useState(0) // seconds remaining
  const sleepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [openMenu, setOpenMenu] = useState<null | 'timer' | 'ab' | 'speed' | 'capture' | 'rotate'>(null) // which overlay submenu is open
  const [locked, setLocked] = useState(false)   // keep the overlay pinned open
  const [ovVisible, setOvVisible] = useState(true) // overlay shown (auto-hides 5s after last interaction when unlocked)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [histView, setHistView] = useState<'list' | 'thumbnails'>('list')
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fs, setFs] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)

  // Whole-video loop mirrors the <video>.loop flag.
  useEffect(() => { if (videoRef.current) videoRef.current.loop = loopAll }, [loopAll, url])

  // Sleep timer — pause the video after N minutes; tick down for the badge.
  useEffect(() => {
    if (sleepRef.current) { clearInterval(sleepRef.current); sleepRef.current = null }
    if (!sleepMin) { setSleepLeft(0); return }
    let left = sleepMin * 60; setSleepLeft(left)
    sleepRef.current = setInterval(() => {
      left -= 1; setSleepLeft(left)
      if (left <= 0) { videoRef.current?.pause(); if (sleepRef.current) clearInterval(sleepRef.current); sleepRef.current = null; setSleepMin(0) }
    }, 1000)
    return () => { if (sleepRef.current) clearInterval(sleepRef.current) }
  }, [sleepMin])

  // Show the overlay + (re)start the 5s auto-hide timer — unless it's locked (stays pinned).
  const showOverlay = useCallback(() => {
    setOvVisible(true)
    if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null }
    if (!locked) hideRef.current = setTimeout(() => { setOvVisible(false); setOpenMenu(null) }, 5000)
  }, [locked])
  useEffect(() => {
    if (locked) { if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null } setOvVisible(true) }
    else showOverlay()
  }, [locked, showOverlay])

  // Video thumbnails for the history "thumbnails" view (grab a frame ~mid-clip).
  useEffect(() => {
    if (histView !== 'thumbnails') return
    history.forEach((h) => {
      const key = h.name + '|' + h.size
      if (thumbs[key]) return
      const v = document.createElement('video'); v.muted = true; v.preload = 'metadata'
      const u = URL.createObjectURL(h.file); v.src = u
      const done = () => URL.revokeObjectURL(u)
      v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 2) / 2) } catch { /* ignore */ } }
      v.onseeked = () => {
        try { const c = document.createElement('canvas'); c.width = 160; c.height = 90; const ctx = c.getContext('2d'); if (ctx) { ctx.drawImage(v, 0, 0, 160, 90); setThumbs((tp) => ({ ...tp, [key]: c.toDataURL('image/jpeg', 0.6) })) } } catch { /* ignore */ }
        done()
      }
      v.onerror = done
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histView, history])

  // Picture-in-Picture (background play) — standard API + iOS webkit fallback; no-op where unsupported.
  async function togglePip() {
    const v = videoRef.current as (HTMLVideoElement & { webkitSetPresentationMode?: (m: string) => void; webkitPresentationMode?: string }) | null
    if (!v) return
    try {
      if (typeof v.webkitSetPresentationMode === 'function' && !document.pictureInPictureElement) {
        v.webkitSetPresentationMode(v.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture'); return
      }
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else if (typeof v.requestPictureInPicture === 'function') await v.requestPictureInPicture()
    } catch { /* unsupported / dismissed */ }
  }
  // Center overlay controls: skip ±5/±10s and play/pause.
  const seekBy = (delta: number) => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, Math.min(v.duration || v.currentTime, v.currentTime + delta)); showOverlay() }
  const togglePlay = () => { const v = videoRef.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause(); showOverlay() }
  // Custom bottom bar (native controls are hidden): scrub, mute, fullscreen.
  const seekTo = (time: number) => { const v = videoRef.current; if (v) v.currentTime = time; showOverlay() }
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); showOverlay() }
  const toggleFs = () => { const el = wrapperRef.current; if (!el) return; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else el.requestFullscreen?.().catch(() => {}); showOverlay() }
  useEffect(() => { const h = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h) }, [])

  const load = useCallback((f: File) => {
    if (!f.type.startsWith('video/')) return
    setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) })
    setBase(f.name.replace(/\.[^.]+$/, '') || 'frame')
    setA(null); setB(null); setRepeat(false); setSpeed(1); setCur(0); setRot(0)
    setCurFile(f)
    // Keep a session history of played videos (newest first, de-duped, capped).
    setHistory((h) => [{ name: f.name, size: f.size, file: f }, ...h.filter((x) => !(x.name === f.name && x.size === f.size))].slice(0, 60)) // eslint-disable-line
    trackToolUsed('video-player')
  }, [])

  // Open a folder: list only its video files into the history list (thumbnails view). Nothing is
  // played until you click one. Folder selection = webkitdirectory (desktop + Android Chrome; not iOS).
  const addFolder = useCallback((list: FileList | null) => {
    if (!list) return
    const vids = Array.from(list).filter((f) => f.type.startsWith('video/')).sort((a, b) => a.name.localeCompare(b.name))
    if (!vids.length) return
    setHistory((h) => {
      const seen = new Set(h.map((x) => x.name + '|' + x.size))
      const add = vids.filter((f) => !seen.has(f.name + '|' + f.size)).map((f) => ({ name: f.name, size: f.size, file: f }))
      return [...add, ...h].slice(0, 60)
    })
    setHistView('thumbnails')
    trackToolUsed('video-player')
  }, [])

  // Revoke the object URL on unmount.
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  // Keep the <video> playbackRate in sync with the chosen speed.
  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = speed }, [speed, url])

  // Accept a video dropped anywhere on the page.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const f = e.dataTransfer?.files?.[0]; if (f) { e.preventDefault(); load(f) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
  }, [load])

  // A–B loop: check the B boundary every animation frame (not the coarse ~4/s
  // 'timeupdate' event) so the loop snaps back within one frame instead of
  // overshooting B by up to ~0.25s — important for tight practice loops.
  useEffect(() => {
    if (!repeat || a == null || b == null || b <= a) return
    let raf = 0
    const tick = () => {
      const v = videoRef.current
      if (v && !v.paused && v.currentTime >= b - 0.02) v.currentTime = a
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [repeat, a, b])

  const seek = (time: number) => { const v = videoRef.current; if (v) { v.currentTime = time; v.play().catch(() => {}) } }

  // Extract the current frame at native resolution — a real frame, not a screenshot.
  function capture() {
    const v = videoRef.current; if (!v || !v.videoWidth) return
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight
    const ctx = c.getContext('2d'); if (!ctx) return
    ctx.drawImage(v, 0, 0, c.width, c.height)
    const type = capFmt === 'png' ? 'image/png' : 'image/jpeg'
    c.toBlob((blob) => {
      if (!blob) return
      const u = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = u; link.download = `${base}_${fmtFile(v.currentTime)}.${capFmt}`; link.click()
      setTimeout(() => URL.revokeObjectURL(u), 2000)
      setCaptured(true); setTimeout(() => setCaptured(false), 1500)
      trackToolDownload('video-player', capFmt)
    }, type, 0.95)
  }

  const chipBtn = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
  const ovBtn = 'pointer-events-auto inline-flex items-center justify-center gap-1 h-9 px-3 rounded-b-xl text-white text-xs font-semibold backdrop-blur transition-colors'
  const subMenu = 'absolute top-full left-1/2 -translate-x-1/2 mt-0.5 min-w-[9rem] pointer-events-auto rounded-lg bg-black/85 backdrop-blur text-white text-xs py-1 shadow-lg z-20 flex flex-col overflow-hidden'
  const subRow = 'w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-white/15 transition-colors tabular-nums'
  const subCell = 'w-full flex items-center justify-center px-3 py-1.5 hover:bg-white/15 transition-colors tabular-nums'

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4">
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onClick={(e) => e.stopPropagation()} onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <input ref={dirRef} type="file" {...({ webkitdirectory: '', directory: '' } as any)} className="hidden" onClick={(e) => e.stopPropagation()} onChange={(e) => { addFolder(e.target.files); e.target.value = '' }} />
            <p className="text-5xl mb-3">🎞️</p>
            <p className="text-base font-medium text-gray-700">{t('vp_drop')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('vp_drop_sub')}</p>
            <div className="flex justify-center gap-2 mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">{t('ui_pick_folder')}</button>
            </div>
          </div>
        ) : (
          <>
            <div ref={wrapperRef} onClick={showOverlay} className="relative overflow-hidden rounded-xl bg-black">
              {/* Native controls hidden — the top tabs + center cluster + bottom bar below are our own. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} src={url} playsInline
                style={{ transform: rot ? `rotate(${rot}deg)` : undefined }}
                className="block w-full max-h-[60vh] transition-transform"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget
                  setDur(v.duration); v.playbackRate = speed; v.loop = loopAll; showOverlay()
                  // Auto-play as soon as the file loads (Q2): selecting the file is a user gesture, so
                  // sound is normally allowed; if a browser blocks it, fall back to muted autoplay.
                  v.muted = false
                  v.play().catch(() => { v.muted = true; v.play().catch(() => {}) })
                }}
                onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} />
              {/* Overlay tab controls — container passes taps through; only buttons/menus capture.
                  Auto-hides 5s after the last interaction unless locked. Each tab opens a submenu below it. */}
              {(ovVisible || locked) && (
                <div className="absolute top-0 inset-x-0 flex items-start justify-center gap-1 pointer-events-none">
                  {/* Lock — pin the overlay open */}
                  <button onClick={() => setLocked((v) => !v)} title={t('vp_lock')} aria-label={t('vp_lock')}
                    className={ovBtn + (locked ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                    {locked
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>}
                  </button>

                  {/* Timer */}
                  <div className="relative">
                    <button onClick={() => { const open = openMenu !== 'timer'; setOpenMenu(open ? 'timer' : null); if (open && sleepMin === 0) setSleepMin(15); showOverlay() }} title={t('vp_timer')} aria-label={t('vp_timer')}
                      className={ovBtn + (sleepMin ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></svg>
                      {sleepMin ? Math.ceil(sleepLeft / 60) : null}
                    </button>
                    {openMenu === 'timer' && (
                      <div className={subMenu}>
                        {TIMER_MENU.map((min) => (
                          <button key={min} onClick={() => { setSleepMin(min); setOpenMenu(null); showOverlay() }}
                            className={subRow + (sleepMin === min ? ' bg-brand-600' : '')}>{t('ct_min', { n: min })}</button>
                        ))}
                        <button onClick={() => { setSleepMin(0); setOpenMenu(null); showOverlay() }} className={subRow + ' border-t border-white/10 text-white/80'}>{t('vp_timer_cancel')}</button>
                      </div>
                    )}
                  </div>

                  {/* A–B repeat */}
                  <div className="relative">
                    <button onClick={() => { const open = openMenu !== 'ab'; setOpenMenu(open ? 'ab' : null); if (open && a === null) setA(cur); showOverlay() }} title={t('vp_ab')} aria-label={t('vp_ab')}
                      className={ovBtn + ((a != null || repeat) ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
                    </button>
                    {openMenu === 'ab' && (
                      <div className={subMenu}>
                        <button onClick={() => { setA(cur); showOverlay() }} className={subRow}><span>{t('vp_start_time')}</span><span className="font-mono text-white/80">{a != null ? fmt(a) : '—'}</span></button>
                        <button onClick={() => { setB(cur); showOverlay() }} className={subRow}><span>{t('vp_end_time')}</span><span className="font-mono text-white/80">{b != null ? fmt(b) : '—'}</span></button>
                        <button onClick={() => { if (a != null && b != null && b > a) { setRepeat(true); showOverlay() } }} className={subRow + (repeat ? ' bg-brand-600' : (a == null || b == null || b <= a ? ' opacity-40' : ''))}><span>{t('vp_repeat_start')}</span></button>
                        <button onClick={() => { setA(null); setB(null); setRepeat(false); showOverlay() }} className={subRow + ' border-t border-white/10 text-white/80'}><span>{t('vp_repeat_cancel')}</span></button>
                      </div>
                    )}
                  </div>

                  {/* Speed */}
                  <div className="relative">
                    <button onClick={() => { setOpenMenu((m) => m === 'speed' ? null : 'speed'); showOverlay() }} title={t('vp_speed')} aria-label={t('vp_speed')}
                      className={ovBtn + ' tabular-nums' + (speed !== 1 ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                      {speed}×
                    </button>
                    {openMenu === 'speed' && (
                      <div className={subMenu + ' min-w-[11rem]'}>
                        {/* 2 columns: slow (<1×) on the left, 1× and up on the right — fits without vertical cutoff on mobile. */}
                        <div className="flex">
                          <div className="flex flex-col flex-1">
                            {SPEED_MENU.filter((s) => s < 1).map((s) => (
                              <button key={s} onClick={() => { setSpeed(s); setOpenMenu(null); showOverlay() }} className={subCell + (speed === s ? ' bg-brand-600' : '')}>{s}×</button>
                            ))}
                          </div>
                          <div className="flex flex-col flex-1 border-l border-white/10">
                            {SPEED_MENU.filter((s) => s >= 1).map((s) => (
                              <button key={s} onClick={() => { setSpeed(s); setOpenMenu(null); showOverlay() }} className={subCell + (speed === s ? ' bg-brand-600' : '')}>{s}×</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => { setSpeed(1); setOpenMenu(null); showOverlay() }} className={subCell + ' border-t border-white/10 text-white/80'}>{t('vp_orig_speed')}</button>
                      </div>
                    )}
                  </div>

                  {/* Capture */}
                  <div className="relative">
                    <button onClick={() => { setOpenMenu((m) => m === 'capture' ? null : 'capture'); showOverlay() }} title={t('vp_capture')} aria-label={t('vp_capture')}
                      className={ovBtn + ' bg-black/55 hover:bg-black/75'}>
                      <ToolIcon name={captured ? 'check' : 'camera'} className="w-4 h-4" />
                    </button>
                    {openMenu === 'capture' && (
                      <div className={subMenu}>
                        <div className={subRow + ' cursor-default'}><span>{t('vp_cap_time')}</span><span className="font-mono text-white/80">{fmt(cur)}</span></div>
                        <div className={subRow + ' cursor-default'}><span>{t('vp_video_time')}</span><span className="font-mono text-white/80">{fmt(dur)}</span></div>
                        <button onClick={() => { capture(); showOverlay() }} className="w-full flex items-center justify-center px-3 py-1.5 border-t border-white/10 bg-brand-600 hover:bg-brand-700 font-semibold transition-colors">{captured ? t('vp_captured') : t('vp_capture')}</button>
                      </div>
                    )}
                  </div>

                  {/* Rotate */}
                  <div className="relative">
                    <button onClick={() => { setOpenMenu((m) => m === 'rotate' ? null : 'rotate'); showOverlay() }} title={t('vp_rotate')} aria-label={t('vp_rotate')}
                      className={ovBtn + (rot ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                      <ToolIcon name="rotate-cw" className="w-4 h-4" />
                    </button>
                    {openMenu === 'rotate' && (
                      <div className={subMenu}>
                        {ROTATE_MENU.map((deg) => (
                          <button key={deg} onClick={() => { setRot(deg); setOpenMenu(null); showOverlay() }} className={subRow + ((rot || 90) === deg ? ' bg-brand-600' : '')}><span>{deg}°</span></button>
                        ))}
                        <button onClick={() => { setRot(0); setOpenMenu(null); showOverlay() }} className={subRow + ' border-t border-white/10 text-white/80'}><span>{t('vp_rotate_cancel')}</span></button>
                      </div>
                    )}
                  </div>

                  {/* Background play (PiP) — no submenu, triggers directly */}
                  <button onClick={() => { togglePip(); showOverlay() }} title={t('vp_bg')} aria-label={t('vp_bg')}
                    className={ovBtn + ' bg-black/55 hover:bg-black/75'}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 10h6V4" /><path d="m2 4 6 6" /><path d="M21 10V7a2 2 0 0 0-2-2h-7" /><path d="M3 14v2a2 2 0 0 0 2 2h3" /><rect width="10" height="7" x="12" y="13" rx="2" /></svg>
                  </button>
                </div>
              )}
              {/* Center controls — skip -10/-5, play/pause, +5/+10. Container passes taps through. */}
              {(ovVisible || locked) && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                  <button onClick={() => seekBy(-10)} aria-label="-10s" className="pointer-events-auto inline-flex items-center gap-0.5 h-9 px-2.5 rounded-full bg-black/55 text-white text-xs font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6z" /></svg>10
                  </button>
                  <button onClick={() => seekBy(-5)} aria-label="-5s" className="pointer-events-auto inline-flex items-center gap-0.5 h-9 px-2.5 rounded-full bg-black/55 text-white text-xs font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6z" /></svg>5
                  </button>
                  <button onClick={togglePlay} aria-label="play" className="pointer-events-auto inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur transition-colors">
                    {playing
                      ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                      : <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>}
                  </button>
                  <button onClick={() => seekBy(5)} aria-label="+5s" className="pointer-events-auto inline-flex items-center gap-0.5 h-9 px-2.5 rounded-full bg-black/55 text-white text-xs font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                    5<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M13 6v12l8.5-6L13 6zM4 6l8.5 6L4 18z" /></svg>
                  </button>
                  <button onClick={() => seekBy(10)} aria-label="+10s" className="pointer-events-auto inline-flex items-center gap-0.5 h-9 px-2.5 rounded-full bg-black/55 text-white text-xs font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                    10<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M13 6v12l8.5-6L13 6zM4 6l8.5 6L4 18z" /></svg>
                  </button>
                </div>
              )}
              {/* Bottom bar — scrub / time / mute / fullscreen (replaces the hidden native bar). */}
              {(ovVisible || locked) && (
                <div className="absolute bottom-0 inset-x-0 p-2 pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-2 px-3 h-9 rounded-full bg-black/60 backdrop-blur text-white text-[11px]">
                    <span className="font-mono tabular-nums shrink-0">{fmt(cur)}</span>
                    <input type="range" min={0} max={dur || 0} step={0.05} value={Math.min(cur, dur || 0)} onChange={(e) => seekTo(+e.target.value)} aria-label="seek" className="flex-1 h-1 accent-white cursor-pointer" />
                    <span className="font-mono tabular-nums shrink-0 text-white/70">{fmt(dur)}</span>
                    <button onClick={toggleMute} aria-label="mute" className="shrink-0 p-1 hover:text-white/70">
                      {muted
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" /></svg>}
                    </button>
                    <button onClick={toggleFs} aria-label="fullscreen" className="shrink-0 p-1 hover:text-white/70">
                      {fs
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /></svg>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Options — frame capture / A–B repeat / speed combined into tabs. */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2">
                {([['frame', t('vp_frame')], ['ab', t('vp_ab')], ['speed', t('vp_speed')]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setOptTab(id)}
                    className={'px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ' + (optTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                    {label}
                  </button>
                ))}
                <button onClick={() => { setUrl(''); setA(null); setB(null); setRepeat(false); setCurFile(null) }} title={t('ui_clear')} aria-label={t('ui_clear')}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700">
                  <ToolIcon name="refresh" className="w-4 h-4" />{t('ui_clear')}
                </button>
              </div>
              <div className="p-4">
                {optTab === 'frame' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                      {(['png', 'jpg'] as const).map((f) => (
                        <button key={f} onClick={() => setCapFmt(f)}
                          className={'px-3 py-1 rounded-md font-semibold uppercase transition-colors ' + (capFmt === f ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>{f}</button>
                      ))}
                    </div>
                    <button onClick={capture} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
                      <ToolIcon name={captured ? 'check' : 'save'} className="w-4 h-4" />{captured ? t('vp_captured') : t('vp_capture')}
                    </button>
                    <span className="ml-auto text-xs text-gray-400 tabular-nums font-mono">{fmt(cur)} / {fmt(dur)}</span>
                  </div>
                )}
                {optTab === 'ab' && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">{t('vp_ab_hint')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setA(cur)} className={chipBtn + ' bg-gray-100 text-gray-700 hover:bg-gray-200'}>{t('vp_set_a')}</button>
                      <button onClick={() => (a != null && seek(a))} disabled={a == null}
                        className="px-2.5 py-1.5 rounded-lg text-sm font-mono tabular-nums bg-brand-50 text-brand-700 border border-brand-200 disabled:opacity-40 hover:bg-brand-100">A {a != null ? fmt(a) : '—'}</button>
                      <button onClick={() => setB(cur)} className={chipBtn + ' bg-gray-100 text-gray-700 hover:bg-gray-200'}>{t('vp_set_b')}</button>
                      <button onClick={() => (b != null && seek(b))} disabled={b == null}
                        className="px-2.5 py-1.5 rounded-lg text-sm font-mono tabular-nums bg-brand-50 text-brand-700 border border-brand-200 disabled:opacity-40 hover:bg-brand-100">B {b != null ? fmt(b) : '—'}</button>
                      <button onClick={() => setRepeat((r) => !r)} disabled={a == null || b == null || b <= a}
                        className={chipBtn + ' inline-flex items-center gap-1.5 disabled:opacity-40 ' + (repeat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                        <ToolIcon name="refresh" className="w-3.5 h-3.5" />{t('vp_repeat')}
                      </button>
                      {(a != null || b != null) && (
                        <button onClick={() => { setA(null); setB(null); setRepeat(false) }} className="px-2.5 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors">{t('vp_clear')}</button>
                      )}
                    </div>
                  </div>
                )}
                {optTab === 'speed' && (
                  <div className="flex flex-wrap gap-1">
                    {SPEEDS.map((s) => (
                      <button key={s} onClick={() => setSpeed(s)}
                        className={'px-3 py-1.5 rounded-lg text-sm font-medium tabular-nums transition-colors ' + (speed === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{s}×</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Play history — videos opened this session; click to replay. List ⇄ thumbnails toggle. */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-700">{t('vp_history')}</p>
              <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                {(['list', 'thumbnails'] as const).map((v) => (
                  <button key={v} onClick={() => setHistView(v)}
                    className={'flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ' + (histView === v ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                    <ToolIcon name={v === 'list' ? 'list' : 'grid'} className="w-3.5 h-3.5" />
                    {v === 'list' ? t('bip_view_list') : t('bip_view_thumb')}
                  </button>
                ))}
              </div>
            </div>
            {histView === 'thumbnails' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {history.map((h, i) => {
                  const key = h.name + '|' + h.size, on = h.file === curFile
                  return (
                    <button key={i} onClick={() => load(h.file)} title={h.name}
                      className={'relative aspect-video rounded-xl overflow-hidden border-2 bg-gray-900 transition-colors ' + (on ? 'border-brand-500' : 'border-gray-200 hover:border-brand-300')}>
                      {thumbs[key]
                        /* eslint-disable-next-line @next/next/no-img-element */
                        ? <img src={thumbs[key]} alt={h.name} className="w-full h-full object-cover" />
                        : <span className="absolute inset-0 flex items-center justify-center text-2xl">🎞️</span>}
                      <span className="absolute bottom-0 inset-x-0 px-1.5 py-0.5 bg-black/60 text-white text-[10px] truncate text-left">{h.name}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <span className="flex-1 min-w-0">{t('vp_col_name')}</span>
                  <span className="shrink-0 w-16 text-right">{t('vp_col_size')}</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-auto">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => load(h.file)}
                      className={'flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors ' + (h.file === curFile ? 'bg-brand-50' : 'hover:bg-gray-50')}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className={'w-4 h-4 shrink-0 ' + (h.file === curFile ? 'text-brand-600' : 'text-gray-300')}><path d="M8 5v14l11-7z" /></svg>
                      <span className={'flex-1 truncate ' + (h.file === curFile ? 'text-brand-700 font-medium' : 'text-gray-700')}>{h.name}</span>
                      <span className="shrink-0 w-16 text-right text-gray-400 tabular-nums">{fmtSize(h.size)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy banner — video never leaves the browser */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('vp_privacy_title')}</b> {t('vp_privacy')}</span>
        </div>

        {/* Related tools — always buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('vp_related')}</span>
          <Link href={`/${lang}/tools/video-trimmer`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['video-trimmer'] || 'Video Trimmer'}</Link>
          <Link href={`/${lang}/tools/video-to-gif`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['video-to-gif'] || 'Video to GIF'}</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
