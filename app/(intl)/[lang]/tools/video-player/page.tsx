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
// mm:ss.d — a compact clock that also shows tenths (handy for A–B precision).
const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60), sec = Math.floor(s % 60), d = Math.floor((s * 10) % 10)
  return `${m}:${String(sec).padStart(2, '0')}.${d}`
}
// Filename-safe timestamp, e.g. 1m03s4.
const fmtFile = (s: number) => `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}s${Math.floor((s * 10) % 10)}`

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
  const [pipSupported, setPipSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Picture-in-Picture support — this button is the DURABLE entry point; never rely on the
  // browser's native controls menu, which varies and auto-hides during playback. Detect both
  // the standard API (Chromium/desktop Safari) AND the iOS Safari webkit presentation mode.
  // Keep the video WITHOUT disablePictureInPicture so the native item stays too.
  useEffect(() => {
    // Detect by METHOD existence, not just document.pictureInPictureEnabled — the latter is
    // false on Android Chrome even where requestPictureInPicture works, which hid the button.
    const proto = typeof HTMLVideoElement !== 'undefined' ? HTMLVideoElement.prototype : null
    const std = typeof document !== 'undefined' && !!document.pictureInPictureEnabled
    const el = !!proto && ('requestPictureInPicture' in proto || 'webkitSupportsPresentationMode' in proto)
    setPipSupported(std || el)
  }, [])
  async function togglePip() {
    const v = videoRef.current as (HTMLVideoElement & {
      webkitSetPresentationMode?: (m: string) => void; webkitPresentationMode?: string
    }) | null
    if (!v) return
    try {
      // iOS Safari: non-standard presentation-mode API.
      if (typeof v.webkitSetPresentationMode === 'function' && !document.pictureInPictureElement) {
        v.webkitSetPresentationMode(v.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture')
        return
      }
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch { /* unsupported or user-dismissed */ }
  }

  const load = useCallback((f: File) => {
    if (!f.type.startsWith('video/')) return
    setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) })
    setBase(f.name.replace(/\.[^.]+$/, '') || 'frame')
    setA(null); setB(null); setRepeat(false); setSpeed(1); setCur(0)
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

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4">
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-5xl mb-3">🎞️</p>
            <p className="text-base font-medium text-gray-700">{t('vp_drop')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('vp_drop_sub')}</p>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} src={url} controls playsInline className="block w-full max-h-[60vh] rounded-xl bg-black"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget
                  setDur(v.duration); v.playbackRate = speed
                  // Auto-play as soon as the file loads. Selecting the file is a user gesture,
                  // so playback with sound is normally allowed; if a browser still blocks it,
                  // fall back to muted autoplay (always permitted). Reset muted each load so a
                  // one-off fallback doesn't silence every later video.
                  v.muted = false
                  v.play().catch(() => { v.muted = true; v.play().catch(() => {}) })
                }}
                onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} />
              {/* Circular PiP pill pinned over the video — always reachable on mobile, where the
                  native controls (and their PiP menu item) auto-hide during playback. */}
              {pipSupported && (
                <button onClick={togglePip} title={t('vp_pip')} aria-label={t('vp_pip')}
                  className="absolute top-2 right-2 z-10 inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-full bg-black/60 text-white text-xs font-semibold hover:bg-black/80 backdrop-blur transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 10h6V4" /><path d="m2 4 6 6" /><path d="M21 10V7a2 2 0 0 0-2-2h-7" /><path d="M3 14v2a2 2 0 0 0 2 2h3" /><rect width="10" height="7" x="12" y="13" rx="2" /></svg>
                  {t('vp_pip_btn')}
                </button>
              )}
            </div>

            {/* Frame capture */}
            <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ToolIcon name="camera" className="w-4 h-4 text-brand-600" />
                <p className="text-sm font-semibold text-gray-700">{t('vp_frame')}</p>
                <span className="ml-auto text-xs text-gray-400 tabular-nums font-mono">{fmt(cur)} / {fmt(dur)}</span>
              </div>
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
              </div>
            </div>

            {/* A–B repeat */}
            <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ToolIcon name="refresh" className="w-4 h-4 text-brand-600" />
                <p className="text-sm font-semibold text-gray-700">{t('vp_ab')}</p>
                <span className="ml-auto text-xs text-gray-400">{t('vp_ab_hint')}</span>
              </div>
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

            {/* Playback speed + reset */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">{t('vp_speed')}</span>
              <div className="flex flex-wrap gap-1">
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className={'px-2.5 py-1 rounded-lg text-xs font-medium tabular-nums transition-colors ' + (speed === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{s}×</button>
                ))}
              </div>
              <button onClick={() => { setUrl(''); setA(null); setB(null); setRepeat(false) }} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ToolIcon name="refresh" className="w-4 h-4" />{t('ui_clear')}
              </button>
            </div>
          </>
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
