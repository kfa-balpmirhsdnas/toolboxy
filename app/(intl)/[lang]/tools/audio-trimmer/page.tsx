'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { getFFmpeg, toClock } from '@/lib/ffmpeg'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('audio-trimmer')!

export default function AudioTrimmerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [dur, setDur] = useState(0)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [status, setStatus] = useState<'' | 'loading' | 'processing'>('')
  const [outUrl, setOutUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    setFile(f); setUrl(URL.createObjectURL(f)); setOutUrl(''); setError('')
    trackToolUsed('audio-trimmer')
  }

  async function trim() {
    if (!file || end <= start) return
    setStatus('loading'); setOutUrl(''); setError('')
    try {
      const { fetchFile } = await import('@ffmpeg/util')
      const ff = await getFFmpeg()
      setStatus('processing')
      const ext = (file.name.split('.').pop() || 'mp3').toLowerCase()
      await ff.writeFile('in.' + ext, await fetchFile(file))
      await ff.exec(['-ss', toClock(start), '-i', 'in.' + ext, '-t', toClock(end - start), '-c', 'copy', 'out.' + ext])
      const data = await ff.readFile('out.' + ext)
      const blob = new Blob([data as Uint8Array], { type: file.type || 'audio/mpeg' })
      setOutUrl(URL.createObjectURL(blob))
      trackToolDownload('audio-trimmer', ext)
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setStatus('')
    }
  }

  function download() {
    if (!outUrl || !file) return
    const ext = (file.name.split('.').pop() || 'mp3').toLowerCase()
    const a = document.createElement('a')
    a.href = outUrl; a.download = file.name.replace(/\.[^.]+$/, '') + '-trimmed.' + ext; a.click()
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🎵</p>
            <p className="text-sm font-medium text-gray-600">{t('md_drop_audio')}</p>
          </div>
        ) : (
          <>
            <audio src={url} controls className="w-full"
              onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDur(d); setEnd(d); setStart(0) }} />
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">{t('md_start')}: <span className="font-mono">{toClock(start)}</span></label>
                <input type="range" min={0} max={dur} step={0.1} value={start} onChange={(e) => setStart(Math.min(+e.target.value, end))} className="w-full" />
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('md_end')}: <span className="font-mono">{toClock(end)}</span></label>
                <input type="range" min={0} max={dur} step={0.1} value={end} onChange={(e) => setEnd(Math.max(+e.target.value, start))} className="w-full" />
              </div>
            </div>
            {status && <p className="text-sm text-brand-600 text-center">{status === 'loading' ? t('md_loading') : t('md_processing')}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            <div className="flex gap-2">
              {!outUrl ? (
                <button onClick={trim} disabled={!!status || end <= start}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{t('md_trim')}</button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')}</button>
              )}
              <button onClick={() => { setUrl(''); setFile(null); setOutUrl('') }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center justify-center" aria-label="reset"><ToolIcon name="refresh" className="w-4 h-4" /></button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_fast')}</p>
      </div>
    </ToolLayout>
  )
}
