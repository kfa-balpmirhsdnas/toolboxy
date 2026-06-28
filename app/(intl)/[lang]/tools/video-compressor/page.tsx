'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { getFFmpeg } from '@/lib/ffmpeg'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('video-compressor')!
// Higher CRF = stronger compression / smaller file. veryfast preset keeps wasm bearable.
const LEVELS: Record<string, number> = { high: 30, medium: 26, low: 23 }
const LEVEL_KEYS = ['high', 'medium', 'low']
const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB')

export default function VideoCompressorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [level, setLevel] = useState('medium')
  const [status, setStatus] = useState<'' | 'loading' | 'processing'>('')
  const [pct, setPct] = useState(0)
  const [out, setOut] = useState<{ url: string; size: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const progAttached = useRef(false)

  function load(f: File) { setFile(f); setUrl(URL.createObjectURL(f)); setOut(null); setError(''); trackToolUsed('video-compressor') }

  async function compress() {
    if (!file) return
    setStatus('loading'); setOut(null); setError(''); setPct(0)
    try {
      const { fetchFile } = await import('@ffmpeg/util')
      const ff = await getFFmpeg()
      if (!progAttached.current) { ff.on('progress', ({ progress }) => setPct(Math.min(99, Math.max(0, Math.round(progress * 100))))); progAttached.current = true }
      setStatus('processing')
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
      await ff.writeFile('in.' + ext, await fetchFile(file))
      await ff.exec(['-i', 'in.' + ext, '-c:v', 'libx264', '-crf', String(LEVELS[level]), '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'out.mp4'])
      const data = await ff.readFile('out.mp4')
      const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
      setOut({ url: URL.createObjectURL(blob), size: blob.size })
      trackToolDownload('video-compressor', 'mp4')
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setStatus('')
    }
  }

  function download() {
    if (!out || !file) return
    const a = document.createElement('a')
    a.href = out.url; a.download = file.name.replace(/\.[^.]+$/, '') + '-compressed.mp4'; a.click()
  }

  const saved = file && out ? Math.round((1 - out.size / file.size) * 100) : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🎬</p>
            <p className="text-sm font-medium text-gray-600">{t('md_drop_video')}</p>
          </div>
        ) : (
          <>
            <video src={url} controls className="w-full max-h-72 rounded-xl bg-black" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('vc_level')}</label>
              <div className="grid grid-cols-3 gap-2">
                {LEVEL_KEYS.map((k) => (
                  <button key={k} onClick={() => { setLevel(k); setOut(null) }} disabled={!!status}
                    className={'py-2 rounded-xl text-sm font-bold transition ' + (level === k ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{t('vc_' + k)}</button>
                ))}
              </div>
            </div>
            {status && <p className="text-sm text-brand-600 text-center">{status === 'loading' ? t('md_loading') : `${t('md_processing')} ${pct}%`}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            {out && (
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
                {t('vc_original')} {fmtBytes(file!.size)} → {t('vc_compressed')} <b>{fmtBytes(out.size)}</b>
                {saved > 0 && <span className="ml-1 font-bold">({t('vc_reduced', { p: saved })})</span>}
              </div>
            )}
            <div className="flex gap-2">
              {!out ? (
                <button onClick={compress} disabled={!!status}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{t('vc_compress')}</button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')}</button>
              )}
              <button onClick={() => { setUrl(''); setFile(null); setOut(null) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">↺</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_fast')}</p>
      </div>
    </ToolLayout>
  )
}
