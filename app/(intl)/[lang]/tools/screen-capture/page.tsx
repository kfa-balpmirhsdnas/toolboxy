'use client'

// Online Screen Capture — grabs a single frame from getDisplayMedia (same screen
// access as screen-recorder) and turns it into a downloadable / copyable image.
// Capture (now or after a 5s countdown) + preview + PNG/JPG download + clipboard
// copy + guide. The 5s mode gives time to hide the browser's screen-share bar so
// it isn't captured. (Crop / annotate / blur come later.)

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('screen-capture')!
const DELAY_SEC = 5

// Grab one frame from a display stream. ImageCapture.grabFrame() pulls the frame
// straight from the track regardless of tab visibility (no requestAnimationFrame),
// so it doesn't stall when sharing a tab pushes this page to the background.
// Falls back to a <video> element where ImageCapture isn't available (e.g. Firefox).
async function grabCanvas(stream: MediaStream): Promise<HTMLCanvasElement> {
  const track = stream.getVideoTracks()[0]
  const IC = (typeof window !== 'undefined' && (window as unknown as { ImageCapture?: any }).ImageCapture) || null
  if (IC) {
    try {
      const bitmap: ImageBitmap = await new IC(track).grabFrame()
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
      bitmap.close?.()
      return canvas
    } catch { /* fall through to the <video> path */ }
  }
  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  await video.play()
  if (!video.videoWidth) await new Promise<void>((r) => { video.onloadedmetadata = () => r() })
  await new Promise<void>((r) => requestAnimationFrame(() => r()))
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas
}

export default function ScreenCapturePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [imgUrl, setImgUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [delayMode, setDelayMode] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Visible countdown. setTimeout (unlike rAF) keeps firing in a background tab,
  // so this resolves even when sharing a tab pushed this page to the background.
  function runCountdown(sec: number): Promise<void> {
    return new Promise((resolve) => {
      let n = sec
      setCountdown(n)
      const tick = () => {
        n -= 1
        if (n <= 0) { setCountdown(null); resolve() }
        else { setCountdown(n); timerRef.current = setTimeout(tick, 1000) }
      }
      timerRef.current = setTimeout(tick, 1000)
    })
  }

  async function capture() {
    setError(''); setCopied(false); setAutoSaved(false); setBusy(true)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setError(t('sc_unsupported')); setBusy(false); return
    }
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      // What did the user share? 'window' | 'browser' (tab) | 'monitor' (full screen) | undefined
      const surface = stream.getVideoTracks()[0].getSettings().displaySurface

      if (delayMode) await runCountdown(DELAY_SEC)
      // Settle: clears the countdown overlay from the frame and lets the first
      // frame arrive before grabbing. setTimeout fires even in a background tab
      // (unlike rAF), so tab sharing no longer adds an extra delay.
      await new Promise((r) => setTimeout(r, 250))

      const canvas = await grabCanvas(stream)
      canvasRef.current = canvas
      setDim({ w: canvas.width, h: canvas.height })
      setImgUrl(canvas.toDataURL('image/png'))
      trackToolUsed('screen-capture')
      // Tab / full screen hide this page behind the captured content, so the user
      // can't reach the download button — auto-save the PNG. Only 'window' keeps
      // the page visible; an unknown surface falls back to auto-saving too.
      if (surface !== 'window') {
        setAutoSaved(true)
        download('png')
      }
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? t('sc_cancelled') : t('sc_failed'))
    } finally {
      stream?.getTracks().forEach((tk) => tk.stop()) // release the share
      setBusy(false); setCountdown(null)
    }
  }

  function toBlob(type: string, quality?: number): Promise<Blob | null> {
    return new Promise((res) => {
      const c = canvasRef.current
      if (!c) { res(null); return }
      c.toBlob((b) => res(b), type, quality) // resolve only from the async callback
    })
  }

  async function download(fmt: 'png' | 'jpg') {
    const blob = await toBlob(fmt === 'jpg' ? 'image/jpeg' : 'image/png', fmt === 'jpg' ? 0.92 : undefined)
    if (!blob) { setError(t('sc_failed')); return }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screenshot-${Date.now()}.${fmt}`
    document.body.appendChild(a) // Firefox needs the anchor in the DOM
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000) // revoke late so the download can start
    trackToolDownload('screen-capture', fmt)
  }

  async function copy() {
    setError('')
    try {
      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) throw new Error('unsupported')
      const blob = await toBlob('image/png')
      if (!blob) throw new Error('noblob')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true); setTimeout(() => setCopied(false), 1600)
      trackToolCopy('screen-capture')
    } catch {
      setError(t('sc_copyfail'))
    }
  }

  const seg = (active: boolean) =>
    'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ' +
    (active ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      {/* Countdown overlay (visible on the page; cleared 250ms before the grab) */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 pointer-events-none">
          <span className="text-[9rem] leading-none font-black text-white drop-shadow-2xl tabular-nums">{countdown}</span>
        </div>
      )}

      {supported === false ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <div className="text-3xl mb-2">🖥️</div>
          <p className="text-sm font-medium text-amber-800">{t('sc_desktoponly')}</p>
          <p className="text-sm text-amber-700 mt-1">{t('sc_desktopdesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Guidance: explain the browser share-picker popup */}
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5 text-sm text-brand-800">
            💡 {t('sc_guide')}
          </div>

          {!imgUrl ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={capture} disabled={supported === null || busy}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
                  {busy ? t('sc_capturing') : '📸 ' + t('sc_capture')}
                </button>
                {/* Timing toggle: immediate (default) or 5s countdown */}
                <div className="inline-flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setDelayMode(false)} disabled={busy} className={seg(!delayMode)}>{t('sc_mode_now')}</button>
                  <button onClick={() => setDelayMode(true)} disabled={busy} className={seg(delayMode)}>{t('sc_mode_delay')}</button>
                </div>
              </div>
              {delayMode && <p className="text-xs text-gray-500">⏱ {t('sc_delay_hint')}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {autoSaved && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">✅ {t('sc_autosaved')}</p>
              )}
              {/* Preview fits a box (max height); the saved/copied image stays full 1:1 resolution */}
              <img src={imgUrl} alt={t('sc_preview_alt')} className="block mx-auto max-w-full max-h-[60vh] w-auto rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0_25%,#fff_0_50%)] bg-[length:20px_20px]" />
              {dim && <p className="text-center text-xs text-gray-400">📐 {dim.w} × {dim.h} px · {t('sc_fullres')}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => download('png')} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ {t('sc_download_png')}</button>
                <button onClick={() => download('jpg')} className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-600 transition-colors">⬇ {t('sc_download_jpg')}</button>
                <button onClick={copy} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">{copied ? '✓ ' + t('sc_copied') : '📋 ' + t('sc_copy')}</button>
                <button onClick={capture} disabled={busy} className="px-5 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 disabled:opacity-50 transition-colors">↻ {t('sc_recapture')}</button>
                {/* Same timing toggle next to 다시 캡처 */}
                <div className="inline-flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setDelayMode(false)} disabled={busy} className={seg(!delayMode)}>{t('sc_mode_now')}</button>
                  <button onClick={() => setDelayMode(true)} disabled={busy} className={seg(delayMode)}>{t('sc_mode_delay')}</button>
                </div>
              </div>
              {delayMode && <p className="text-xs text-gray-500">⏱ {t('sc_delay_hint')}</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          <p className="text-xs text-gray-400 flex items-center gap-1.5">🔒 {t('sc_privacy')}</p>
        </div>
      )}
    </ToolLayout>
  )
}
