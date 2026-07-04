'use client'

import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'
import { vhList, vhPutMeta, vhPutManyMeta, vhSave, vhSetBlob, vhSetThumb, vhDelete, vhClear } from '@/lib/tools/videoHistory'

const tool = getToolBySlug('video-player')!
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
// Overlay submenu option sets.
const TIMER_MENU = [15, 30, 60, 120]
// Media extensions kept in one place so the picker filter and the drop/folder guard stay in sync.
const MEDIA_EXTS = [
  'mp4', 'm4v', 'mov', 'mkv', 'webm', 'avi', 'mpeg', 'mpg', 'ogv', '3gp', '3g2', 'flv', 'f4v', 'ts', 'mts', 'm2ts', 'wmv', 'asf', 'divx', 'vob', // video
  'mp3', 'm4a', 'm4b', 'wav', 'flac', 'aac', 'ogg', 'oga', 'opus', 'wma', 'aiff', 'aif', 'amr', 'caf', // audio
]
// Some containers (.mkv/.ts/.flv…) arrive with an empty MIME type, so accept by extension too.
const MEDIA_EXT = new RegExp('\\.(' + MEDIA_EXTS.join('|') + ')$', 'i')
const isMedia = (f: File) => f.type.startsWith('video/') || f.type.startsWith('audio/') || MEDIA_EXT.test(f.name)
// mm:ss.d — a compact clock that also shows tenths (handy for A–B precision).
const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60), sec = Math.floor(s % 60), d = Math.floor((s * 10) % 10)
  return `${m}:${String(sec).padStart(2, '0')}.${d}`
}
// Filename-safe timestamp, e.g. 1m03s4.
const fmtFile = (s: number) => `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}s${Math.floor((s * 10) % 10)}`
const fmtSize = (b: number) => (b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB')
// Compact size for narrow mobile columns — round UP, drop decimals, MB→M / KB→K (e.g. 3K, 12M).
const fmtSizeShort = (b: number) => (b < 1024 * 1024 ? Math.ceil(b / 1024) + 'K' : Math.ceil(b / 1024 / 1024) + 'M')

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
  const [history, setHistory] = useState<{ name: string; size: number; file: File | null }[]>([]) // file null = metadata-only (not saved), needs re-open
  const [curFile, setCurFile] = useState<File | null>(null)
  // Overlay controls (on top of the video; the tab controls below stay as-is).
  const [rot, setRot] = useState(0)            // display rotation 0/90/180/270
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 }) // measured video-frame size (for fit-to-frame rotation)
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('all') // default: 전체 반복 (playlist loop)
  const [sleepMin, setSleepMin] = useState(0)   // sleep-timer minutes (0 = off)
  const [sleepLeft, setSleepLeft] = useState(0) // seconds remaining
  const sleepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [openMenu, setOpenMenu] = useState<null | 'timer' | 'ab' | 'speed' | 'capture' | 'repeat'>(null) // which overlay submenu is open
  const [locked, setLocked] = useState(false)   // keep the overlay pinned open
  const [ovVisible, setOvVisible] = useState(true) // overlay shown (auto-hides 5s after last interaction when unlocked)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [histView, setHistView] = useState<'list' | 'thumbnails'>('list')
  const [histTab, setHistTab] = useState<'all' | 'saved'>('all') // 전체 / 보관
  const [saved, setSaved] = useState<Set<string>>(() => new Set()) // starred (kept) clip keys
  const [optOpen, setOptOpen] = useState(false) // options box (frame/ab/speed) — collapsed by default
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fs, setFs] = useState(false)
  const [showVol, setShowVol] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showBright, setShowBright] = useState(false) // brightness gauge popup
  const [brightness, setBrightness] = useState(1)     // CSS filter brightness on the video
  const [nightMode, setNightMode] = useState(false)   // warm/dim filter for comfortable night viewing
  const [audioOnly, setAudioOnly] = useState(false) // no video track — show a music poster so the box isn't 0-height
  const [audioMode, setAudioMode] = useState(false)  // "listen only" — hide the frame behind the poster; audio keeps playing (screen off) via MediaSession
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)       // the black video frame — measured so a 90°/270° rotation fills it (like turning the phone)
  const inputRef = useRef<HTMLInputElement>(null)   // video picker (opens gallery straight — no capture chooser)
  const dirRef = useRef<HTMLInputElement>(null)     // folder picker (dir picker; also reaches audio files)
  const audioElRef = useRef<HTMLAudioElement>(null) // background player used in audio mode / for audio-only files
  const pipPlayingRef = useRef(true)                // play state sampled while in PiP, to restore it on exit
  const switchPosRef = useRef(0)                    // playback position carried across audio↔video element switches
  const pendingVideoSeekRef = useRef(0)             // seek the <video> here once it reloads (leaving audio mode)
  const positionsRef = useRef<Record<string, number>>({}) // last-played position per clip (name|size → seconds)
  const resumePosRef = useRef(0)                    // seek the freshly-loaded clip here (resume where you left off)
  const posSaveTsRef = useRef(0)                    // throttle the localStorage writes
  useEffect(() => { try { const s = localStorage.getItem('vp_pos_v1'); if (s) positionsRef.current = JSON.parse(s) } catch { /* ignore */ } }, [])

  // In "audio mode" (and for audio-only files) playback runs through the <audio> element — browsers keep
  // audio elements playing when the screen turns off, whereas a <video> gets paused in the background.
  const useAudioEl = audioMode || audioOnly
  const activeRef = useRef<HTMLMediaElement | null>(null)
  useEffect(() => { activeRef.current = useAudioEl ? audioElRef.current : videoRef.current }, [useAudioEl, url])
  const media = (): HTMLMediaElement | null => (useAudioEl ? audioElRef.current : videoRef.current)

  // Resume-position bookkeeping (per clip). savePos is throttled; flush=true writes immediately.
  const writePositions = () => { try { localStorage.setItem('vp_pos_v1', JSON.stringify(positionsRef.current)) } catch { /* ignore */ } }
  const savePos = (t: number, flush = false) => {
    const key = curFile ? curFile.name + '|' + curFile.size : ''
    if (!key || !(t > 0)) return
    positionsRef.current[key] = t
    const now = Date.now()
    if (flush || now - posSaveTsRef.current > 3000) { posSaveTsRef.current = now; writePositions() }
  }
  const clearPos = () => { const key = curFile ? curFile.name + '|' + curFile.size : ''; if (key && positionsRef.current[key] != null) { delete positionsRef.current[key]; writePositions() } }

  // Whole-video loop mirrors the .loop flag on both elements.
  useEffect(() => { [videoRef.current, audioElRef.current].forEach((el) => { if (el) el.loop = repeatMode === 'one' }) }, [repeatMode, url])

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
    if (!locked) hideRef.current = setTimeout(() => { setOvVisible(false); setOpenMenu(null); setShowVol(false); setShowBright(false) }, 6000)
  }, [locked])
  useEffect(() => {
    if (locked) { if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null } setOvVisible(true) }
    else showOverlay()
  }, [locked, showOverlay])
  // Tap the video: toggle the overlay (show if hidden, hide if shown). Taps on a control
  // (button/input) bubble here too, so ignore those — the control shows the overlay itself.
  const toggleOverlay = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button,input,a')) return
    if (!locked && ovVisible) {
      setOvVisible(false); setOpenMenu(null); setShowVol(false); setShowBright(false)
      if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null }
    } else showOverlay()
  }, [locked, ovVisible, showOverlay])

  // Video thumbnails for the history "thumbnails" view (grab a frame ~mid-clip).
  useEffect(() => {
    if (histView !== 'thumbnails') return
    history.forEach((h) => {
      const key = h.name + '|' + h.size
      if (thumbs[key] || !h.file) return // metadata-only clips (no blob) keep the 🎞️ placeholder
      const v = document.createElement('video'); v.muted = true; v.preload = 'metadata'
      const u = URL.createObjectURL(h.file); v.src = u
      const done = () => URL.revokeObjectURL(u)
      v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 2) / 2) } catch { /* ignore */ } }
      v.onseeked = () => {
        try { const c = document.createElement('canvas'); c.width = 160; c.height = 90; const ctx = c.getContext('2d'); if (ctx) { ctx.drawImage(v, 0, 0, 160, 90); const data = c.toDataURL('image/jpeg', 0.6); setThumbs((tp) => ({ ...tp, [key]: data })); vhSetThumb(key, data) } } catch { /* ignore */ }
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
  // Center overlay controls: skip ±5/±10s and play/pause. These target the active element (video or audio).
  const seekBy = (delta: number) => { const v = media(); if (v) v.currentTime = Math.max(0, Math.min(v.duration || v.currentTime, v.currentTime + delta)); showOverlay() }
  const togglePlay = () => { const v = media(); if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause(); showOverlay() }
  // Custom bottom bar (native controls are hidden): scrub, mute, fullscreen.
  const seekTo = (time: number) => { const v = media(); if (v) v.currentTime = time; showOverlay() }
  // Volume/mute apply to BOTH elements so the setting carries across audio↔video switches.
  const toggleMute = () => { const v = media(); if (!v) return; const nm = !v.muted;[videoRef.current, audioElRef.current].forEach((el) => { if (el) el.muted = nm }); setMuted(nm); showOverlay() }
  const setVol = (val: number) => { [videoRef.current, audioElRef.current].forEach((el) => { if (el) { el.volume = val; el.muted = val === 0 } }); setVolume(val); setMuted(val === 0); showOverlay() }
  const toggleFs = () => { const el = wrapperRef.current; if (!el) return; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else el.requestFullscreen?.().catch(() => {}); showOverlay() }
  useEffect(() => { const h = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h) }, [])
  // Some browsers flip the play state when the PiP window closes. Sample the play state WHILE in PiP
  // (stopping before the exit transition can corrupt it), then restore that exact state after exit.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    let poll = 0
    const onEnter = () => { pipPlayingRef.current = !v.paused; poll = window.setInterval(() => { pipPlayingRef.current = !v.paused }, 200) }
    const onLeave = () => {
      if (poll) { clearInterval(poll); poll = 0 }
      const want = pipPlayingRef.current
      if (useAudioEl) return
      // Enforce after the browser settles so our decision wins over its own pause/play on exit.
      setTimeout(() => { const el = videoRef.current; if (!el) return; if (want && el.paused) el.play().catch(() => {}); else if (!want && !el.paused) el.pause() }, 120)
    }
    v.addEventListener('enterpictureinpicture', onEnter)
    v.addEventListener('leavepictureinpicture', onLeave)
    return () => { v.removeEventListener('enterpictureinpicture', onEnter); v.removeEventListener('leavepictureinpicture', onLeave); if (poll) clearInterval(poll) }
  }, [url, useAudioEl])

  // advance = playlist auto-advance (repeat-all): keep the history order stable so "next" cycles the whole list.
  const load = useCallback((f: File, advance = false) => {
    if (!isMedia(f)) return
    setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) })
    setBase(f.name.replace(/\.[^.]+$/, '') || 'frame')
    setA(null); setB(null); setRepeat(false); setCur(0); setAudioMode(false); setAudioOnly(false)
    // Resume where this clip was last left off (saved per file); audio-only resumes via switchPosRef.
    const resume = positionsRef.current[f.name + '|' + f.size] || 0
    resumePosRef.current = resume; switchPosRef.current = resume; pendingVideoSeekRef.current = 0
    setCurFile(f)
    if (!advance) {
      // Keep a session history of played videos (newest first, de-duped, capped).
      setHistory((h) => [{ name: f.name, size: f.size, file: f }, ...h.filter((x) => !(x.name === f.name && x.size === f.size))].slice(0, 60)) // eslint-disable-line
    }
    // Persist metadata so the list survives a refresh; the actual blob is only kept for ★ saved clips.
    const id = f.name + '|' + f.size
    const meta = { id, name: f.name, size: f.size, type: f.type }
    if (savedRef.current.has(id)) vhSave(meta, f); else vhPutMeta(meta)
    trackToolUsed('video-player')
  }, [])
  // Play the next clip for repeat-all — cycles the CURRENTLY OPEN tab (전체 or 보관), wrapping around.
  function playNext() {
    const list = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
    if (!list.length) return
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : -1
    // Advance to the next PLAYABLE clip (skip metadata-only entries that have no blob).
    for (let step = 1; step <= list.length; step++) {
      const next = list[(idx + step) % list.length]
      if (next?.file) { load(next.file, true); return }
    }
  }
  // Previous playable clip in the open tab (wraps around).
  function playPrev() {
    const list = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
    if (!list.length) return
    const idx = curFile ? list.findIndex((x) => x.file === curFile) : 0
    for (let step = 1; step <= list.length; step++) {
      const prev = list[(idx - step + list.length) % list.length]
      if (prev?.file) { load(prev.file, true); return }
    }
  }

  // Restore the persisted list on mount (metadata for all; a File only for ★ saved clips whose blob was kept).
  useEffect(() => {
    let alive = true
    vhList().then((items) => {
      if (!alive || !items.length) return
      const restored = items.map((it) => ({ name: it.name, size: it.size, file: it.blob ? new File([it.blob], it.name, { type: it.type }) : null }))
      setHistory((h) => {
        const seen = new Set(h.map((x) => x.name + '|' + x.size))
        return [...h, ...restored.filter((r) => !seen.has(r.name + '|' + r.size))].slice(0, 60)
      })
      const th: Record<string, string> = {}
      items.forEach((it) => { if (it.thumb) th[it.name + '|' + it.size] = it.thumb })
      if (Object.keys(th).length) setThumbs((p) => ({ ...th, ...p }))
    })
    return () => { alive = false }
  }, [])

  // "보관" (Saved) tab — starred clip keys, persisted so the shelf survives refreshes.
  const savedRef = useRef<Set<string>>(new Set())
  useEffect(() => { savedRef.current = saved }, [saved])
  useEffect(() => { try { const s = localStorage.getItem('vp_saved_v1'); if (s) setSaved(new Set(JSON.parse(s))) } catch { /* ignore */ } }, [])
  // Star ⇒ persist the video blob (hybrid: only saved clips keep their video). Unstar ⇒ drop the blob (keep metadata).
  const toggleSaved = useCallback((key: string, file: File | null) => {
    setSaved((prev) => {
      const n = new Set(prev); const willSave = !n.has(key)
      if (willSave) { n.add(key); if (file) vhSave({ id: key, name: file.name, size: file.size, type: file.type }, file) } else { n.delete(key); vhSetBlob(key, null) }
      try { localStorage.setItem('vp_saved_v1', JSON.stringify(Array.from(n))) } catch { /* ignore */ }
      return n
    })
  }, [])

  // Wipe the whole list — metadata, saved blobs, stars and resume positions.
  const resetHistory = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm(t('vp_reset_confirm'))) return
    setHistory([]); setSaved(new Set()); setThumbs({})
    positionsRef.current = {}
    try { localStorage.removeItem('vp_saved_v1'); localStorage.removeItem('vp_pos_v1') } catch { /* ignore */ }
    vhClear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Remove a clip from the list (and its persisted blob + saved star).
  const removeFromHistory = useCallback((key: string) => {
    setHistory((h) => h.filter((x) => (x.name + '|' + x.size) !== key))
    vhDelete(key)
    setSaved((prev) => {
      if (!prev.has(key)) return prev
      const n = new Set(prev); n.delete(key)
      try { localStorage.setItem('vp_saved_v1', JSON.stringify(Array.from(n))) } catch { /* ignore */ }
      return n
    })
  }, [])

  // Load a clip and scroll the player up into view — used for file pickers, drops, and history clicks.
  const loadAndScroll = useCallback((f: File) => {
    load(f)
    requestAnimationFrame(() => wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [load])
  // Click a history item: play it if we still have the file (in-session or ★ saved); otherwise it's a
  // metadata-only entry after a refresh — the browser can't reopen it by path, so open the FOLDER picker.
  // Re-selecting the folder restores every clip in it (matched by name+size), not just this one.
  const openHistItem = useCallback((f: File | null) => { if (f) loadAndScroll(f); else dirRef.current?.click() }, [loadAndScroll])

  // Open a folder: list only its video files into the history list (thumbnails view). Nothing is
  // played until you click one. Folder selection = webkitdirectory (desktop + Android Chrome; not iOS).
  const addFolder = useCallback((list: FileList | null) => {
    if (!list) return
    const vids = Array.from(list).filter(isMedia).sort((a, b) => a.name.localeCompare(b.name))
    if (!vids.length) return
    setHistory((h) => {
      const byKey = new Map(vids.map((f) => [f.name + '|' + f.size, f]))
      const seen = new Set(h.map((x) => x.name + '|' + x.size))
      const add = vids.filter((f) => !seen.has(f.name + '|' + f.size)).map((f) => ({ name: f.name, size: f.size, file: f }))
      // Re-opening a folder restores the File on any matching metadata-only entries (dimmed → playable again).
      const restored = h.map((x) => { const f = byKey.get(x.name + '|' + x.size); return f && !x.file ? { ...x, file: f } : x })
      return [...add, ...restored].slice(0, 60)
    })
    // Persist metadata for every folder clip so the list survives a refresh (blobs stay session-only until ★ saved).
    vhPutManyMeta(vids.map((f) => ({ id: f.name + '|' + f.size, name: f.name, size: f.size, type: f.type })))
    trackToolUsed('video-player')
  }, [])

  // Open with: play the video file the OS launched the installed app with (File Handling API).
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      for (const h of p?.files || []) { try { load(await h.getFile()); break } catch { /* skip */ } }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Revoke the object URL on unmount.
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  // Keep both elements' playbackRate in sync with the chosen speed.
  useEffect(() => { [videoRef.current, audioElRef.current].forEach((el) => { if (el) el.playbackRate = speed }) }, [speed, url])

  // Measure the black video frame so a 90°/270° rotation can swap width/height and fill it (turn-the-phone effect).
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => setBoxSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fs, url, audioMode, audioOnly])

  // Transfer playback between the <video> and <audio> elements when audio mode / audio-only flips.
  // The <video> src is dropped in audio mode (binding below) so the page holds NO video-track element —
  // that's what lets the browser treat playback as pure audio and keep it alive with the screen off.
  useEffect(() => {
    const v = videoRef.current, aEl = audioElRef.current
    if (!aEl || !url) return
    const at = switchPosRef.current
    if (useAudioEl) {
      aEl.playbackRate = speed; aEl.volume = v?.volume ?? volume; aEl.muted = v?.muted ?? muted
      try { aEl.currentTime = at } catch { /* not seekable yet */ }
      v?.pause()
      // Entering audio mode always starts playback (even if it was paused) — otherwise "audio mode" is pointless.
      aEl.play().then(() => { try { if (Math.abs(aEl.currentTime - at) > 0.4) aEl.currentTime = at } catch { /* ignore */ } }).catch(() => {})
    } else {
      aEl.pause()
      // The <video> src is being restored by the binding; seek+resume once it has reloaded (onLoadedMetadata).
      pendingVideoSeekRef.current = at
      if (v && v.readyState > 0) { try { v.currentTime = at } catch { /* ignore */ }; v.play().catch(() => {}) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAudioEl])

  // MediaSession — lock-screen controls + background audio (keeps playing with the screen off on Android).
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null
    const ms = nav?.mediaSession
    if (!ms) return
    if (!url) { try { ms.metadata = null } catch { /* ignore */ } return }
    try {
      const MM = (window as any).MediaMetadata
      if (MM) ms.metadata = new MM({ title: base, artist: 'ToolBoxy', artwork: [{ src: '/icons/video-player.png', sizes: '512x512', type: 'image/png' }] })
    } catch { /* ignore */ }
    const v = () => activeRef.current || videoRef.current
    const set = (action: string, handler: any) => { try { ms.setActionHandler(action, handler) } catch { /* unsupported action */ } }
    set('play', () => v()?.play().catch(() => {}))
    set('pause', () => v()?.pause())
    set('seekbackward', (d: any) => { const el = v(); if (el) el.currentTime = Math.max(0, el.currentTime - (d?.seekOffset || 10)) })
    set('seekforward', (d: any) => { const el = v(); if (el) el.currentTime = Math.min(el.duration || 0, el.currentTime + (d?.seekOffset || 10)) })
    set('seekto', (d: any) => { const el = v(); if (el && d?.seekTime != null) el.currentTime = d.seekTime })
    return () => { ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'].forEach((a) => set(a, null)) }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [url, base])

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
      const v = (audioElRef.current && !audioElRef.current.paused) ? audioElRef.current : videoRef.current
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
  // Bottom-bar variant of the top tab style — same look, but rounded on top so tabs hang up from the bottom edge.
  const ovBtnB = 'pointer-events-auto inline-flex items-center justify-center gap-1 h-9 px-3 rounded-t-xl text-white text-xs font-semibold backdrop-blur transition-colors'
  const subMenu = 'absolute top-full left-1/2 -translate-x-1/2 mt-0.5 min-w-[9rem] pointer-events-auto rounded-lg bg-black/85 backdrop-blur text-white text-xs py-1 shadow-lg z-20 flex flex-col overflow-hidden'
  const subRow = 'w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-white/15 transition-colors tabular-nums'
  const subCell = 'w-full flex items-center justify-center px-3 py-1.5 hover:bg-white/15 transition-colors tabular-nums'
  // Shared slider (gauge) styling — white thumb, two-tone track via an inline gradient.
  const gaugeCls = 'w-40 h-1.5 appearance-none rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0'
  const fillBg = (pct: number) => ({ background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.25) ${pct}%)` })
  // History filtered by the 전체 / 보관 tab.
  const shownHistory = history.filter((h) => histTab === 'all' || saved.has(h.name + '|' + h.size))
  const starSvg = (key: string) => (
    <svg viewBox="0 0 24 24" fill={saved.has(key) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></svg>
  )
  // Circular loop with an optional letter in the middle (repeat one/all icons).
  const loopLetter = (letter: string) => (
    <span className="relative inline-flex shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 12a10 10 0 0 1 17-7" /><path d="M22 12a10 10 0 0 1-17 7" /><path d="m19 2 .5 3.3-3.3.5" /><path d="m5 22-.5-3.3 3.3-.5" /></svg>
      {letter && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none">{letter}</span>}
    </span>
  )

  // Control-bar button style. Inline: plain icon buttons (the whole bar is already black) so they don't
  // read as separate rounded tabs and don't break on narrow widths. Fullscreen: keep the translucent
  // per-button background since they ride over the video.
  const barBtn = (active: boolean) => fs
    ? (ovBtnB + (active ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75'))
    : ('pointer-events-auto inline-flex items-center justify-center gap-1 h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors ' + (active ? 'bg-brand-600 text-white' : 'text-white hover:bg-white/10'))

  // The player's control bar (file pickers + speed/volume/fullscreen/PiP). Rendered below the video
  // when inline (always visible), and as a bottom overlay in fullscreen (where there is no "below").
  const bottomBar = (
    <>
      {/* Open — left: video picker (straight to gallery) + folder picker (dir picker; also lists audio, no capture chooser) */}
      <div className="flex items-end gap-1">
        <button onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} aria-label={t('vp_pick_video')} title={t('vp_pick_video')} className={barBtn(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg><span className="hidden sm:inline">{t('vp_pick_video')}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} aria-label={t('vp_pick_folder')} title={t('vp_pick_folder')} className={barBtn(false)}>
          <ToolIcon name="folder" className="w-4 h-4" /><span className="hidden sm:inline">{t('vp_pick_folder')}</span>
        </button>
      </div>
      {/* Controls — right */}
      <div className="flex items-end gap-1">
        {/* Speed — options appear as a horizontal row above the bar (rendered at bar level below) */}
        <button onClick={() => { setOpenMenu((m) => m === 'speed' ? null : 'speed'); setShowVol(false); setShowBright(false); showOverlay() }} aria-label={t('vp_speed')} title={t('vp_speed')}
          className={barBtn(speed !== 1) + ' tabular-nums'}>{speed}×</button>
        {/* Volume — gauge appears as a horizontal slider above the bar (rendered at bar level below) */}
        <button onClick={() => { setShowVol((s) => !s); setOpenMenu(null); setShowBright(false); showOverlay() }} aria-label="volume" className={barBtn(false)}>
          {(muted || volume === 0)
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" /></svg>}
        </button>
        {/* Brightness — gauge above the bar */}
        <button onClick={() => { setShowBright((s) => !s); setShowVol(false); setOpenMenu(null); showOverlay() }} aria-label={t('vp_brightness')} title={t('vp_brightness')} className={barBtn(brightness !== 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
        </button>
        {/* Fullscreen */}
        <button onClick={toggleFs} aria-label="fullscreen" className={barBtn(false)}>
          {fs
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /></svg>}
        </button>
        {/* Background play (PiP) — far right */}
        <button onClick={() => { togglePip(); showOverlay() }} aria-label={t('vp_bg')} title={t('vp_bg')} className={barBtn(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 10h6V4" /><path d="m2 4 6 6" /><path d="M21 10V7a2 2 0 0 0-2-2h-7" /><path d="M3 14v2a2 2 0 0 0 2 2h3" /><rect width="10" height="7" x="12" y="13" rx="2" /></svg>
        </button>
      </div>
      {/* Speed / volume appear as a horizontal row ABOVE the bar (spans the bar width, so it stays on-screen). */}
      {openMenu === 'speed' && (
        <div className="absolute bottom-full inset-x-0 mb-1 flex justify-center pointer-events-none z-20">
          <div className="pointer-events-auto flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg bg-black/90 backdrop-blur text-white shadow-lg">
            {/* presets */}
            <div className="flex items-center gap-0.5">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((p) => (
                <button key={p} onClick={() => { setSpeed(p); showOverlay() }} className={'px-1.5 h-6 rounded text-[10px] tabular-nums transition-colors ' + (speed === p ? 'bg-brand-600 text-white' : 'text-white/70 hover:bg-white/15')}>{p}×</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={(e) => { setSpeed(+e.target.value); showOverlay() }} aria-label="playback speed"
                style={fillBg(((speed - 0.25) / 2.75) * 100)} className={gaugeCls} />
              <span className="text-[10px] tabular-nums text-white/80 w-8 text-right">{speed}×</span>
            </div>
          </div>
        </div>
      )}
      {showVol && (
        <div className="absolute bottom-full inset-x-0 mb-1 flex justify-center pointer-events-none z-20">
          <div className="pointer-events-auto flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg bg-black/90 backdrop-blur text-white shadow-lg">
            {/* presets */}
            <div className="flex items-center gap-0.5">
              {[0, 10, 30, 50, 60, 80, 100].map((p) => (
                <button key={p} onClick={() => { setVol(p / 100); showOverlay() }} className={'px-1.5 h-6 rounded text-[10px] tabular-nums transition-colors ' + (Math.round(volume * 100) === p ? 'bg-brand-600 text-white' : 'text-white/70 hover:bg-white/15')}>{p}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVol(+e.target.value)} aria-label="volume level"
                style={fillBg(volume * 100)} className={gaugeCls} />
              <span className="text-[10px] tabular-nums text-white/80 w-6 text-right">{Math.round(volume * 100)}</span>
            </div>
          </div>
        </div>
      )}
      {showBright && (
        <div className="absolute bottom-full inset-x-0 mb-1 flex justify-center pointer-events-none z-20">
          <div className="pointer-events-auto flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg bg-black/90 backdrop-blur text-white shadow-lg">
            {/* presets — centered at 0 (normal), negative = dimmer, positive = brighter */}
            <div className="flex items-center gap-0.5">
              {[-60, -40, -20, 0, 20, 40, 60].map((o) => (
                <button key={o} onClick={() => { setBrightness(1 + o / 100); showOverlay() }} className={'px-1.5 h-6 rounded text-[10px] tabular-nums transition-colors ' + (Math.round((brightness - 1) * 100) === o ? 'bg-brand-600 text-white' : 'text-white/70 hover:bg-white/15')}>{o > 0 ? '+' + o : o}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-white/70"><circle cx="12" cy="12" r="4" /><path d="M12 3v1" /><path d="M12 20v1" /><path d="M3 12h1" /><path d="M20 12h1" /></svg>
              <input type="range" min={0.3} max={1.7} step={0.05} value={brightness} onChange={(e) => { setBrightness(+e.target.value); showOverlay() }} aria-label="brightness"
                style={fillBg(((brightness - 0.3) / 1.4) * 100)} className={gaugeCls} />
              <span className="text-[10px] tabular-nums text-white/80 w-8 text-right">{(Math.round((brightness - 1) * 100) > 0 ? '+' : '') + Math.round((brightness - 1) * 100)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // Rotation that mimics turning the phone: the whole "stage" (video + overlay controls) rotates as a
  // unit. For 90°/270° we swap the stage's width/height to the measured black box, so the rotated stage
  // fills the area instead of being clipped and the controls turn together with the video.
  const filterStr = (brightness !== 1 || nightMode)
    ? `brightness(${(brightness * (nightMode ? 0.68 : 1)).toFixed(2)})${nightMode ? ' contrast(0.82) sepia(0.08)' : ''}`
    : undefined
  const quarterTurned = (rot === 90 || rot === 270) && boxSize.w > 0 && boxSize.h > 0
  // Non-rotated: the stage fills the black box (absolute inset-0) so the top strip / bottom bar anchor to the
  // box edges (top strip hugs the very top). Rotated: the stage becomes the swapped, centred, rotated frame.
  const stageStyle: CSSProperties = quarterTurned
    ? { position: 'absolute', left: '50%', top: '50%', width: boxSize.h, height: boxSize.w, transform: `translate(-50%, -50%) rotate(${rot}deg)` }
    : { position: 'absolute', inset: 0, transform: rot ? `rotate(${rot}deg)` : undefined }
  const stageCls = 'flex items-center justify-center'
  const videoCls = 'block object-contain w-full h-full'
  // Landscape enlarges the picture, so bump the overlay controls by a FIXED factor (portrait = 1, landscape
  // = 1.4). A fixed value avoids the measurement-driven ratio occasionally blowing up to a huge scale.
  const ovScale = quarterTurned ? 1.4 : 1
  const ovScaleStyle = (origin: string): CSSProperties | undefined =>
    quarterTurned ? { transform: `scale(${ovScale.toFixed(3)})`, transformOrigin: origin } : undefined

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4">
        {/* Always-mounted inputs so the in-player buttons work too (the drop zone unmounts once a video loads).
            Video (video/*) opens the gallery straight; the folder picker is a directory picker — neither
            triggers Android's camera/recorder capture chooser. Audio files are opened via the folder. */}
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadAndScroll(e.target.files[0])} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <input ref={dirRef} type="file" {...({ webkitdirectory: '', directory: '' } as any)} className="hidden" onChange={(e) => { addFolder(e.target.files); e.target.value = '' }} />
        {/* Background audio element — used in audio mode / for audio-only files (keeps playing screen-off). */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioElRef} src={url || undefined} preload="metadata"
          onPlay={() => { setPlaying(true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'playing' } catch { /* ignore */ } }}
          onPause={(e) => { setPlaying(false); if (useAudioEl) savePos(e.currentTarget.currentTime, true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'paused' } catch { /* ignore */ } }}
          onEnded={() => { if (useAudioEl) clearPos(); if (repeatMode === 'all' && useAudioEl) playNext() }}
          onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume) }}
          onTimeUpdate={(e) => {
            if (!useAudioEl) return
            const el = e.currentTarget; setCur(el.currentTime); savePos(el.currentTime)
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const ms = (navigator as any).mediaSession
            if (ms?.setPositionState && el.duration && isFinite(el.duration)) { try { ms.setPositionState({ duration: el.duration, position: Math.min(el.currentTime, el.duration), playbackRate: el.playbackRate || 1 }) } catch { /* ignore */ } }
          }} />
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && loadAndScroll(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <p className="text-5xl mb-3">🎞️</p>
            <p className="text-base font-medium text-gray-700">{t('vp_drop')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('vp_drop_sub')}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>{t('vp_pick_video')}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                <ToolIcon name="folder" className="w-4 h-4" />{t('vp_pick_folder')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={wrapperRef} onClick={toggleOverlay} className={'scroll-mt-16 ' + (fs ? 'fixed inset-0 z-50 flex items-center justify-center bg-black' : '')}>
              {/* Inner box sizes to the video so the overlays hug the VIDEO (not the fullscreen screen);
                  in fullscreen the outer flex centers this box vertically. */}
              {/* Inline uses a min-height so short (landscape) clips are letterboxed — gives the top tabs + center
                  cluster room instead of cramming into a thin box. object-contain centers the video in the black. */}
              <div ref={boxRef} className={'relative overflow-hidden bg-black w-full flex items-center justify-center '
                + (fs ? 'h-full ' : 'rounded-xl ')
                + ((audioOnly || audioMode) ? 'min-h-[50vh] sm:min-h-[260px] ' : (fs ? '' : 'min-h-[50vh] sm:min-h-0 '))}>
              {/* Rotating stage: video + all overlay controls turn together (so the menu rotates with the screen). */}
              <div style={stageStyle} className={stageCls}>
              {/* Native controls hidden — the top tabs + center cluster + bottom bar below are our own. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} src={useAudioEl ? undefined : url} playsInline
                style={{ filter: filterStr }}
                className={videoCls}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget
                  setDur(v.duration); v.playbackRate = speed; v.loop = repeatMode === 'one'; setAudioOnly(!v.videoWidth); showOverlay()
                  // Restore the position when the video reloads after leaving audio mode; otherwise resume
                  // where this clip was last left off (skip if it's near the very start or end).
                  if (pendingVideoSeekRef.current) { try { v.currentTime = pendingVideoSeekRef.current } catch { /* ignore */ } pendingVideoSeekRef.current = 0 }
                  else if (resumePosRef.current > 1 && v.duration && resumePosRef.current < v.duration - 2) { try { v.currentTime = resumePosRef.current } catch { /* ignore */ } }
                  resumePosRef.current = 0
                  // Auto-play as soon as the file loads (Q2): selecting the file is a user gesture, so
                  // sound is normally allowed; if a browser blocks it, fall back to muted autoplay.
                  v.muted = false
                  v.play().catch(() => { v.muted = true; v.play().catch(() => {}) })
                }}
                onPlay={() => { setPlaying(true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'playing' } catch { /* ignore */ } }}
                onPause={(e) => { setPlaying(false); if (!useAudioEl) savePos(e.currentTarget.currentTime, true); try { (navigator as unknown as { mediaSession?: { playbackState: string } }).mediaSession!.playbackState = 'paused' } catch { /* ignore */ } }}
                onEnded={() => { if (!useAudioEl) clearPos(); if (repeatMode === 'all' && !useAudioEl) playNext() }}
                onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume) }}
                onTimeUpdate={(e) => {
                  if (useAudioEl) return
                  const v = e.currentTarget; setCur(v.currentTime); savePos(v.currentTime)
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  const ms = (navigator as any).mediaSession
                  if (ms?.setPositionState && v.duration && isFinite(v.duration)) { try { ms.setPositionState({ duration: v.duration, position: Math.min(v.currentTime, v.duration), playbackRate: v.playbackRate || 1 }) } catch { /* ignore */ } }
                }} />
              {/* Music poster — for audio-only files, and for "audio mode" where we hide the video frame but keep audio playing. */}
              {(audioOnly || audioMode) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/80 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 opacity-90"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  <span className="max-w-[80%] truncate text-sm font-medium">{base}</span>
                </div>
              )}
              {/* Overlay tab controls — container passes taps through; only buttons/menus capture.
                  Auto-hides 5s after the last interaction unless locked. Each tab opens a submenu below it. */}
              {(ovVisible || locked) && (
                <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
                  <div style={ovScaleStyle('top center')} className="flex flex-col items-center gap-1">
                  <div className="flex items-start gap-1">
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
                    </button>
                    {openMenu === 'timer' && (
                      <div className={subMenu + ' min-w-[10rem]'}>
                        {/* Remaining time on top */}
                        <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 text-white/80">
                          <span>{t('vp_time_left')}</span>
                          <span className="font-mono tabular-nums">{sleepMin ? `${Math.floor(sleepLeft / 60)}:${String(sleepLeft % 60).padStart(2, '0')}` : '—'}</span>
                        </div>
                        {/* 2 columns */}
                        <div className="flex">
                          <div className="flex flex-col flex-1">
                            {TIMER_MENU.slice(0, 2).map((min) => (
                              <button key={min} onClick={() => { setSleepMin(min); setOpenMenu(null); showOverlay() }} className={subCell + (sleepMin === min ? ' bg-brand-600' : '')}>{t('ct_min', { n: min })}</button>
                            ))}
                          </div>
                          <div className="flex flex-col flex-1 border-l border-white/10">
                            {TIMER_MENU.slice(2).map((min) => (
                              <button key={min} onClick={() => { setSleepMin(min); setOpenMenu(null); showOverlay() }} className={subCell + (sleepMin === min ? ' bg-brand-600' : '')}>{t('ct_min', { n: min })}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => { setSleepMin(0); setOpenMenu(null); showOverlay() }} className={subCell + ' gap-1.5 border-t border-white/10 text-white/80'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0"><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>{t('vp_timer_cancel')}</button>
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
                      <div className={subMenu + ' w-max whitespace-nowrap'}>
                        <button onClick={() => { setA(cur); showOverlay() }} className={subRow}><span>{t('vp_start_time')}</span><span className="font-mono text-white inline-flex items-center gap-1 border border-white/30 rounded px-1.5 py-0.5 bg-white/10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>{a != null ? fmt(a) : t('vp_set')}</span></button>
                        <button onClick={() => { setB(cur); showOverlay() }} className={subRow}><span>{t('vp_end_time')}</span><span className="font-mono text-white inline-flex items-center gap-1 border border-white/30 rounded px-1.5 py-0.5 bg-white/10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>{b != null ? fmt(b) : t('vp_set')}</span></button>
                        <button onClick={() => { if (repeat) { setRepeat(false); showOverlay() } else if (a != null && b != null && b > a) { setRepeat(true); showOverlay() } }} className={subRow + (repeat ? ' bg-brand-600' : (a == null || b == null || b <= a ? ' opacity-40' : ''))}><span className="flex items-center gap-2"><ToolIcon name="refresh" className="w-3.5 h-3.5 shrink-0" />{repeat ? t('vp_repeat_stop') : t('vp_repeat_start')}</span></button>
                        <button onClick={() => { setA(null); setB(null); setRepeat(false); setOpenMenu(null); showOverlay() }} className={subRow + ' border-t border-white/10 text-white/80'}><span className="flex items-center gap-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0"><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>{t('vp_repeat_cancel')}</span></button>
                      </div>
                    )}
                  </div>

                  {/* Capture */}
                  <div className="relative">
                    <button onClick={() => { capture(); setOpenMenu((m) => m === 'capture' ? null : 'capture'); showOverlay() }} title={t('vp_capture')} aria-label={t('vp_capture')}
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

                  {/* Rotate — tap toggles portrait ↔ landscape (0° ↔ 90°) */}
                  <button onClick={() => { setRot((r) => r ? 0 : 90); showOverlay() }} title={t('vp_rotate')} aria-label={t('vp_rotate')}
                    className={ovBtn + (rot ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                    {/* screen-rotation: a tilted phone with two rotation arrows */}
                    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className="w-4 h-4"><path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zM10.23 1.75c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm3.6 18.65L3.6 10.17l6.57-6.57 10.23 10.23-6.57 6.57zM7.51 21.43C4.4 20.85 2.06 17.68 1.7 13.92H.2C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.34 1.31z" /></svg>
                  </button>

                  {/* Repeat — 한곡 반복 / 전체 반복 */}
                  <div className="relative">
                    <button onClick={() => { setOpenMenu((m) => m === 'repeat' ? null : 'repeat'); showOverlay() }} title={t('vp_repeat')} aria-label={t('vp_repeat')}
                      className={ovBtn + (repeatMode !== 'off' ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                      <span className="relative inline-flex">
                        {/* circular loop with a "1" in the middle — distinct from the A–B section-repeat icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 12a10 10 0 0 1 17-7" /><path d="M22 12a10 10 0 0 1-17 7" /><path d="m19 2 .5 3.3-3.3.5" /><path d="m5 22-.5-3.3 3.3-.5" /></svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold leading-none">{repeatMode === 'all' ? 'A' : '1'}</span>
                      </span>
                    </button>
                    {openMenu === 'repeat' && (
                      <div className={subMenu}>
                        <button onClick={() => { setRepeatMode('one'); setOpenMenu(null); showOverlay() }} className={subRow + (repeatMode === 'one' ? ' bg-brand-600' : '')}><span className="flex items-center gap-2">{loopLetter('1')}{t('vp_repeat_one')}</span></button>
                        <button onClick={() => { setRepeatMode('all'); setOpenMenu(null); showOverlay() }} className={subRow + (repeatMode === 'all' ? ' bg-brand-600' : '')}><span className="flex items-center gap-2">{loopLetter('A')}{t('vp_repeat_all')}</span></button>
                        <button onClick={() => { setRepeatMode('off'); setOpenMenu(null); showOverlay() }} className={subRow + ' border-t border-white/10 text-white/80'}><span className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>
                          {t('vp_repeat_off')}</span></button>
                      </div>
                    )}
                  </div>

                  {/* Night mode — warm/dim filter for comfortable night viewing (moon; highlighted when on) */}
                  <button onClick={() => { setNightMode((n) => !n); showOverlay() }} title={t('vp_night')} aria-label={t('vp_night')}
                    className={ovBtn + (nightMode ? ' bg-brand-600/90 hover:bg-brand-600' : ' bg-black/55 hover:bg-black/75')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                  </button>

                  </div>
                  {/* Video title — shown with the overlay */}
                  {base && <div className="max-w-[280px] truncate px-3 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-sm font-medium text-center pointer-events-auto">{base}</div>}
                </div>
                </div>
              )}
              {/* Center controls — skip/play cluster with the time gauge right below it (same width). */}
              {(ovVisible || locked) && (
                <div style={ovScaleStyle('center')} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="inline-flex flex-col items-stretch gap-2">
                    {/* Row 1: previous video / play / next video */}
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={playPrev} aria-label="previous video" className="pointer-events-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/55 text-white hover:bg-black/75 backdrop-blur transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M19 20 9 12l10-8z" /><rect x="4" y="4" width="2.4" height="16" rx="1" /></svg>
                      </button>
                      <button onClick={togglePlay} aria-label="play" className="pointer-events-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur transition-colors">
                        {playing
                          ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                          : <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9"><path d="M8 5v14l11-7z" /></svg>}
                      </button>
                      <button onClick={playNext} aria-label="next video" className="pointer-events-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/55 text-white hover:bg-black/75 backdrop-blur transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="m5 4 10 8-10 8z" /><rect x="17.6" y="4" width="2.4" height="16" rx="1" /></svg>
                      </button>
                    </div>
                    {/* Row 2: -30 -10 -5 / +5 +10 +30 */}
                    <div className="flex items-center justify-center gap-1">
                      {[30, 10, 5].map((n) => (
                        <button key={'m' + n} onClick={() => seekBy(-n)} aria-label={`-${n}s`} className="pointer-events-auto inline-flex items-center gap-0.5 h-8 px-2 rounded-full bg-black/55 text-white text-[11px] font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6z" /></svg>{n}
                        </button>
                      ))}
                      {/* separator between rewind and forward groups — a hollow circle the size of a seek button */}
                      <span aria-hidden className="w-8 h-8 rounded-full border border-white/25 shrink-0" />
                      {[5, 10, 30].map((n) => (
                        <button key={'p' + n} onClick={() => seekBy(n)} aria-label={`+${n}s`} className="pointer-events-auto inline-flex items-center gap-0.5 h-8 px-2 rounded-full bg-black/55 text-white text-[11px] font-bold hover:bg-black/75 backdrop-blur transition-colors tabular-nums">
                          {n}<svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M13 6v12l8.5-6L13 6zM4 6l8.5 6L4 18z" /></svg>
                        </button>
                      ))}
                    </div>
                    {/* Time gauge — same width as the 5 buttons above. */}
                    <div className="pointer-events-auto flex items-center gap-2 px-3 h-8 rounded-full bg-black/60 backdrop-blur text-white text-[11px]">
                      <span className="font-mono tabular-nums shrink-0">{fmt(cur)}</span>
                      <input type="range" min={0} max={dur || 0} step={0.05} value={Math.min(cur, dur || 0)} onChange={(e) => seekTo(+e.target.value)} aria-label="seek" className="flex-1 h-1 accent-white cursor-pointer min-w-0" />
                      <span className="font-mono tabular-nums shrink-0 text-white/70">{fmt(dur)}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Fullscreen: the control bar rides as a bottom overlay (there's no room "below" the video). */}
              {fs && (ovVisible || locked) && (
                <div style={ovScaleStyle('bottom center')} className={'absolute bottom-0 inset-x-0 flex items-end gap-1 pointer-events-none ' + (quarterTurned ? 'justify-center gap-2' : 'justify-between')}>
                  {bottomBar}
                </div>
              )}
              </div>
              </div>
            </div>
            {/* Inline: the control bar sits below the video as a persistent black toolbar (always visible). */}
            {!fs && (
              <div style={{ marginTop: 1 }} className="relative flex items-center justify-between gap-1 rounded-xl bg-black px-1.5 py-1">
                {bottomBar}
              </div>
            )}

            {/* Options — frame capture / A–B repeat / speed combined into tabs. Collapsed by default. */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className={'flex items-center gap-1 bg-gray-50 px-2 ' + (optOpen ? 'border-b border-gray-200' : '')}>
                {(['frame', 'ab', 'speed'] as const).map((id) => {
                  const label = id === 'frame' ? t('vp_frame') : id === 'ab' ? t('vp_ab') : t('vp_speed')
                  const icon = id === 'frame'
                    ? <ToolIcon name="camera" className="w-4 h-4" />
                    : id === 'ab'
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
                      : <span className="w-4 h-4 inline-flex items-center justify-center text-[11px] font-bold tabular-nums leading-none">{speed}×</span>
                  return (
                    <button key={id} onClick={() => { setOptTab(id); setOptOpen(true) }} title={label} aria-label={label}
                      className={'inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ' + (optOpen && optTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                      <span className="sm:hidden">{icon}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  )
                })}
                <button onClick={() => setOptOpen((o) => !o)} aria-label={optOpen ? t('ui_collapse') : t('ui_expand')} title={optOpen ? t('ui_collapse') : t('ui_expand')}
                  className="ml-auto inline-flex items-center px-2.5 py-2 text-gray-400 hover:text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-4 h-4 transition-transform ' + (optOpen ? 'rotate-180' : '')}><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
              {optOpen && (
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
                    {/* Mobile: A row / B row / repeat row (3 lines). Desktop: one wrapping row. */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setA(cur)} className={chipBtn + ' bg-gray-100 text-gray-700 hover:bg-gray-200'}>{t('vp_set_a')}</button>
                        <button onClick={() => (a != null && seek(a))} disabled={a == null}
                          className="px-2.5 py-1.5 rounded-lg text-sm font-mono tabular-nums bg-brand-50 text-brand-700 border border-brand-200 disabled:opacity-40 hover:bg-brand-100">A {a != null ? fmt(a) : '—'}</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setB(cur)} className={chipBtn + ' bg-gray-100 text-gray-700 hover:bg-gray-200'}>{t('vp_set_b')}</button>
                        <button onClick={() => (b != null && seek(b))} disabled={b == null}
                          className="px-2.5 py-1.5 rounded-lg text-sm font-mono tabular-nums bg-brand-50 text-brand-700 border border-brand-200 disabled:opacity-40 hover:bg-brand-100">B {b != null ? fmt(b) : '—'}</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setRepeat((r) => !r)} disabled={a == null || b == null || b <= a}
                          className={chipBtn + ' inline-flex items-center gap-1.5 disabled:opacity-40 ' + (repeat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                          <ToolIcon name="refresh" className="w-3.5 h-3.5" />{t('vp_repeat_start')}
                        </button>
                        <button onClick={() => { setA(null); setB(null); setRepeat(false) }} disabled={a == null && b == null && !repeat}
                          className="px-2.5 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 disabled:opacity-40 disabled:hover:text-gray-500 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-colors">{t('vp_repeat_cancel')}</button>
                      </div>
                    </div>
                  </div>
                )}
                {optTab === 'speed' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {SPEEDS.map((s) => (
                        <button key={s} onClick={() => setSpeed(s)}
                          className={'px-3 py-1.5 rounded-lg text-sm font-medium tabular-nums transition-colors ' + (speed === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{s}×</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0.25} max={3} step={0.05} value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-label={t('vp_speed')}
                        className="flex-1 h-1.5 cursor-pointer accent-brand-600" />
                      <span className="text-sm font-mono tabular-nums text-gray-600 w-12 text-right">{speed}×</span>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </>
        )}

        {/* Play history — videos opened this session; click to replay. List ⇄ thumbnails toggle. */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {/* 전체 / 보관 tabs (replaces the old "재생 기록" title) */}
              <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                {([['all', t('vp_tab_all')], ['saved', t('vp_tab_saved')]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setHistTab(id)}
                    className={'px-3 py-1 rounded-md font-semibold transition-colors ' + (histTab === id ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                    {label} {id === 'all' ? history.length : saved.size}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                  {(['list', 'thumbnails'] as const).map((v) => (
                    <button key={v} onClick={() => setHistView(v)}
                      className={'flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ' + (histView === v ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                      <ToolIcon name={v === 'list' ? 'list' : 'grid'} className="w-3.5 h-3.5" />
                      {v === 'list' ? t('bip_view_list') : t('bip_view_thumb')}
                    </button>
                  ))}
                </div>
                <button onClick={resetHistory} title={t('vp_reset')} aria-label={t('vp_reset')} className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
            </div>
            {shownHistory.length === 0 ? (
              <p className="flex items-center justify-center gap-1.5 text-sm text-gray-400 text-center py-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></svg>
                {t('vp_save')}
              </p>
            ) : histView === 'thumbnails' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {shownHistory.map((h, i) => {
                  const key = h.name + '|' + h.size, on = h.file === curFile
                  return (
                    <div key={i} title={h.file ? h.name : h.name + ' — ' + t('vp_reopen')}
                      className={'relative aspect-video rounded-xl overflow-hidden border-2 bg-gray-900 transition-colors ' + (on ? 'border-brand-500' : 'border-gray-200 hover:border-brand-300')}>
                      <button onClick={() => openHistItem(h.file)} className={'absolute inset-0 w-full h-full ' + (h.file ? '' : 'opacity-60')}>
                        {thumbs[key]
                          /* eslint-disable-next-line @next/next/no-img-element */
                          ? <img src={thumbs[key]} alt={h.name} className="w-full h-full object-cover" />
                          : <span className="absolute inset-0 flex items-center justify-center text-2xl">🎞️</span>}
                        <span className="absolute bottom-0 inset-x-0 px-1.5 py-0.5 bg-black/60 text-white text-[10px] truncate text-left">{h.name}</span>
                      </button>
                      {h.file && (
                        <button onClick={() => toggleSaved(key, h.file)} aria-label={t('vp_save')} title={t('vp_save')}
                          className={'absolute top-1 left-1 z-10 p-1 rounded-md bg-black/40 transition-colors ' + (saved.has(key) ? 'text-amber-400' : 'text-white/70 hover:text-amber-300')}>
                          {starSvg(key)}
                        </button>
                      )}
                      <button onClick={() => removeFromHistory(key)} aria-label={t('ui_delete')} title={t('ui_delete')}
                        className="absolute top-1 right-1 z-10 p-1 rounded-md bg-black/40 text-white/70 [@media(hover:hover)]:hover:text-red-400 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <span className="w-5 shrink-0" />
                  <span className="flex-1 min-w-0">{t('vp_col_name')}</span>
                  <span className="shrink-0 w-16 text-right">{t('vp_col_size')}</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-auto">
                  {shownHistory.map((h, i) => {
                    const key = h.name + '|' + h.size
                    return (
                      <div key={i} className={'flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ' + (h.file === curFile ? 'bg-brand-50' : 'hover:bg-gray-50')}>
                        {h.file
                          ? <button onClick={() => toggleSaved(key, h.file)} aria-label={t('vp_save')} title={t('vp_save')}
                              className={'shrink-0 transition-colors ' + (saved.has(key) ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400')}>
                              {starSvg(key)}
                            </button>
                          : <span className="w-4 shrink-0" />}
                        <button onClick={() => openHistItem(h.file)} title={h.file ? undefined : t('vp_reopen')} className={'flex items-center gap-2 flex-1 min-w-0 text-left ' + (h.file ? '' : 'opacity-50')}>
                          <span className={'flex-1 truncate ' + (h.file === curFile ? 'text-brand-700 font-medium' : 'text-gray-700')}>{h.name}</span>
                        </button>
                        <span className="shrink-0 sm:w-16 text-right text-gray-400 tabular-nums whitespace-nowrap">
                          <span className="sm:hidden">{fmtSizeShort(h.size)}</span>
                          <span className="hidden sm:inline">{fmtSize(h.size)}</span>
                        </span>
                        <button onClick={() => removeFromHistory(key)} aria-label={t('ui_delete')} title={t('ui_delete')} className="shrink-0 p-1 text-gray-300 [@media(hover:hover)]:hover:text-red-500 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                      </div>
                    )
                  })}
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
