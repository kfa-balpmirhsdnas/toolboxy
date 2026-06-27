'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('video-to-gif')!

export default function VideoToGifPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [dur, setDur] = useState(0)
  const [start, setStart] = useState(0)
  const [len, setLen] = useState(3)
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(320)
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [out, setOut] = useState<{ url: string; size: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) { setSrc(URL.createObjectURL(f)); setOut(null); trackToolUsed('video-to-gif') }

  function seek(v: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((res) => { const h = () => { v.removeEventListener('seeked', h); res() }; v.addEventListener('seeked', h); v.currentTime = time })
  }

  async function convert() {
    const v = videoRef.current; if (!v) return
    setBusy(true); setProg(0); setOut(null)
    try {
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc')
      const ratio = width / v.videoWidth
      const w = width, h = Math.round(v.videoHeight * ratio)
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      const gif = GIFEncoder()
      const total = Math.max(1, Math.round(len * fps))
      const delay = Math.round(1000 / fps)
      for (let i = 0; i < total; i++) {
        await seek(v, Math.min(dur - 0.01, start + i / fps))
        ctx.drawImage(v, 0, 0, w, h)
        const { data } = ctx.getImageData(0, 0, w, h)
        const palette = quantize(data, 256)
        const index = applyPalette(data, palette)
        gif.writeFrame(index, w, h, { palette, delay })
        setProg(Math.round(((i + 1) / total) * 100))
      }
      gif.finish()
      const blob = new Blob([gif.bytes()], { type: 'image/gif' })
      setOut({ url: URL.createObjectURL(blob), size: blob.size })
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }

  function download() { if (!out) return; const a = document.createElement('a'); a.href = out.url; a.download = 'animation.gif'; a.click(); trackToolDownload('video-to-gif', 'gif') }
  const fmt = (b: number) => (b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vg_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('vg_subtitle')}</p>
        </div>

        {!src ? (
          <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🎞️</p><p className="text-sm font-medium text-gray-600">{t('vg_drop')}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} src={src} onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDur(d); setLen(Math.min(3, d)) }} className="w-full rounded-xl bg-black max-h-60" muted playsInline controls />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex flex-col gap-1 text-gray-600">{t('vg_start')} ({start.toFixed(1)}s)
                <input type="range" min={0} max={Math.max(0, dur - 0.5)} step={0.1} value={start} onChange={(e) => setStart(+e.target.value)} /></label>
              <label className="flex flex-col gap-1 text-gray-600">{t('vg_len')} ({len.toFixed(1)}s)
                <input type="range" min={0.5} max={Math.min(10, dur)} step={0.5} value={len} onChange={(e) => setLen(+e.target.value)} /></label>
              <label className="flex flex-col gap-1 text-gray-600">FPS: {fps}
                <input type="range" min={5} max={20} step={1} value={fps} onChange={(e) => setFps(+e.target.value)} /></label>
              <label className="flex flex-col gap-1 text-gray-600">{t('vg_width')}: {width}px
                <input type="range" min={160} max={640} step={20} value={width} onChange={(e) => setWidth(+e.target.value)} /></label>
            </div>
            <div className="flex gap-2">
              <button onClick={convert} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? t('vg_converting', { n: prog }) : t('vg_convert')}</button>
              <button onClick={() => setSrc('')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('vg_change')}</button>
            </div>
            {out && (
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">GIF · {fmt(out.size)}</span>
                <button onClick={download} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ {t('vg_download')}</button>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-gray-400">{t('vg_note')}</p>
      </div>
    </ToolLayout>
  )
}
