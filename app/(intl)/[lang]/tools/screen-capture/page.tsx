'use client'

// Online Screen Capture — picks a source via getDisplayMedia (same access as
// screen-recorder), shows it live, and freezes a frame on demand. Capturing on
// demand (not instantly) is what makes tab / full-screen sharing usable: the
// user sees the shared content in the live preview and chooses the moment.
// This pass: capture (+3s timer) + preview + PNG/JPG download + clipboard copy
// + guide. (Crop / annotate / blur come later.)

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('screen-capture')!

export default function ScreenCapturePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [imgUrl, setImgUrl] = useState('')
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia)
    return () => stopStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Attach the stream to the live <video> once it has mounted.
  useEffect(() => {
    if (live && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [live])

  function stopStream() {
    streamRef.current?.getTracks().forEach((tk) => tk.stop())
    streamRef.current = null
  }

  async function startShare() {
    setError(''); setCopied(false); setImgUrl(''); setBusy(true)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setError(t('sc_unsupported')); setBusy(false); return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      streamRef.current = stream
      // If the user stops sharing from the browser bar, drop back to the start.
      stream.getVideoTracks()[0].addEventListener('ended', () => cancelShare())
      setLive(true)
      trackToolUsed('screen-capture')
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? t('sc_cancelled') : t('sc_failed'))
    } finally {
      setBusy(false)
    }
  }

  function grab() {
    const video = videoRef.current
    if (!video || !video.videoWidth) { setError(t('sc_failed')); return }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvasRef.current = canvas
    setDim({ w: canvas.width, h: canvas.height })
    setImgUrl(canvas.toDataURL('image/png'))
    stopStream(); setLive(false); setCountdown(null)
  }

  function grabAfter(sec: number) {
    let n = sec
    setCountdown(n)
    const step = () => {
      n -= 1
      if (n <= 0) { setCountdown(null); grab() }
      else { setCountdown(n); timerRef.current = setTimeout(step, 1000) }
    }
    timerRef.current = setTimeout(step, 1000)
  }

  function cancelShare() {
    if (timerRef.current) clearTimeout(timerRef.current)
    stopStream(); setLive(false); setCountdown(null)
  }

  function toBlob(type: string, quality?: number): Promise<Blob | null> {
    return new Promise((res) => {
      const c = canvasRef.current
      if (!c) { res(null); return }
      c.toBlob((b) => res(b), type, quality)
    })
  }

  async function download(fmt: 'png' | 'jpg') {
    const blob = await toBlob(fmt === 'jpg' ? 'image/jpeg' : 'image/png', fmt === 'jpg' ? 0.92 : undefined)
    if (!blob) { setError(t('sc_failed')); return }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screenshot-${Date.now()}.${fmt}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
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

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      {supported === false ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <div className="text-3xl mb-2">🖥️</div>
          <p className="text-sm font-medium text-amber-800">{t('sc_desktoponly')}</p>
          <p className="text-sm text-amber-700 mt-1">{t('sc_desktopdesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step 1 — start sharing */}
          {!live && !imgUrl && (
            <>
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5 text-sm text-brand-800">💡 {t('sc_guide')}</div>
              <button onClick={startShare} disabled={supported === null || busy}
                className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {busy ? t('sc_capturing') : '📸 ' + t('sc_capture')}
              </button>
            </>
          )}

          {/* Step 2 — live preview, capture on demand */}
          {live && (
            <div className="space-y-3">
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5 text-sm text-brand-800">💡 {t('sc_live_guide')}</div>
              {/* Controls go ABOVE the preview so they stay visible even when a
                  full-screen source makes the preview tall. */}
              <div className="flex flex-wrap gap-2">
                <button onClick={grab} disabled={countdown !== null} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">📸 {t('sc_grab')}</button>
                <button onClick={() => grabAfter(3)} disabled={countdown !== null} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">⏱ {t('sc_grab_3s')}</button>
                <button onClick={cancelShare} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">{t('sc_cancel')}</button>
              </div>
              <div className="relative w-fit mx-auto">
                <video ref={videoRef} autoPlay muted playsInline className="block max-w-full max-h-[40vh] w-auto rounded-xl border border-gray-200 bg-black" />
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <span className="text-7xl font-black text-white drop-shadow-lg">{countdown}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — captured image */}
          {imgUrl && (
            <div className="space-y-3">
              {/* Preview fits a box; the saved/copied image stays full 1:1 resolution */}
              <img src={imgUrl} alt={t('sc_preview_alt')} className="block mx-auto max-w-full max-h-[60vh] w-auto rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0_25%,#fff_0_50%)] bg-[length:20px_20px]" />
              {dim && <p className="text-center text-xs text-gray-400">📐 {dim.w} × {dim.h} px · {t('sc_fullres')}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => download('png')} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ {t('sc_download_png')}</button>
                <button onClick={() => download('jpg')} className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-600 transition-colors">⬇ {t('sc_download_jpg')}</button>
                <button onClick={copy} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">{copied ? '✓ ' + t('sc_copied') : '📋 ' + t('sc_copy')}</button>
                <button onClick={startShare} disabled={busy} className="px-5 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 disabled:opacity-50 transition-colors">↻ {t('sc_recapture')}</button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          <p className="text-xs text-gray-400 flex items-center gap-1.5">🔒 {t('sc_privacy')}</p>
        </div>
      )}
    </ToolLayout>
  )
}
