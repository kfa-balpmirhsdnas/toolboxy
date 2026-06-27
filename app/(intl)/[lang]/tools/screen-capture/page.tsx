'use client'

// Online Screen Capture — grabs a single frame from getDisplayMedia (same screen
// access as screen-recorder) and turns it into a downloadable / copyable image.
// This first pass: capture + preview + PNG/JPG download + clipboard copy + guide.
// (Crop / annotate / blur / timer come later.)

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('screen-capture')!

export default function ScreenCapturePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [imgUrl, setImgUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null)
  const [autoSaved, setAutoSaved] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia)
  }, [])

  async function capture() {
    setError(''); setCopied(false); setAutoSaved(false); setBusy(true)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setError(t('sc_unsupported')); setBusy(false); return
    }
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      const track = stream.getVideoTracks()[0]
      // What did the user share? 'window' | 'browser' (tab) | 'monitor' (full screen) | undefined
      const surface = track.getSettings().displaySurface
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      // Wait for real dimensions, then one paint so the frame isn't blank.
      if (!video.videoWidth) await new Promise((r) => { video.onloadedmetadata = () => r(null) })
      await new Promise((r) => requestAnimationFrame(() => r(null)))

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
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
      stream?.getTracks().forEach((tk) => tk.stop()) // release the share immediately
      setBusy(false)
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
          {/* Guidance: explain the browser share-picker popup */}
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5 text-sm text-brand-800">
            💡 {t('sc_guide')}
          </div>

          {!imgUrl ? (
            <button onClick={capture} disabled={supported === null || busy}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {busy ? t('sc_capturing') : '📸 ' + t('sc_capture')}
            </button>
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
