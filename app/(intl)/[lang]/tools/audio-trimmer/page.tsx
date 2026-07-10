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
  const audioRef = useRef<HTMLAudioElement>(null)

  function load(f: File) {
    setFile(f); setUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f) }); setOutUrl(''); setError('')
    trackToolUsed('audio-trimmer')
  }

  // Whichever trim point you're adjusting (slider drag or ±chip), the player seeks there so
  // you HEAR exactly where the cut lands (same behaviour as the video trimmer).
  const seekTo = (sec: number) => { const a = audioRef.current; if (a && isFinite(sec)) try { a.currentTime = Math.min(Math.max(0, sec), dur || sec) } catch { /* ignore */ } }
  const NUDGES = [-10, -5, -1, 1, 5, 10]
  const nudgeStart = (d: number) => setStart((s) => { const n = Math.min(Math.max(0, +(s + d).toFixed(1)), end); seekTo(n); return n })
  const nudgeEnd = (d: number) => setEnd((e) => { const n = Math.max(Math.min(dur, +(e + d).toFixed(1)), start); seekTo(n); return n })
  const nudgeRow = (fn: (d: number) => void) => (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {NUDGES.map((d) => (
        <button key={d} onClick={() => fn(d)}
          className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 active:bg-brand-100 tabular-nums">
          {d > 0 ? '+' : ''}{d}s
        </button>
      ))}
    </div>
  )

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
        {/* always mounted so the 불러오기 button can open the picker with a file already loaded */}
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ''; if (f) load(f) }} />
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <p className="text-4xl mb-2">🎵</p>
            <p className="text-sm font-medium text-gray-600">{t('md_drop_audio')}</p>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        ) : (
          <>
            <audio ref={audioRef} src={url} controls className="w-full"
              onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDur(d); setEnd(d); setStart(0) }} />
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">{t('md_start')}: <span className="font-mono">{toClock(start)}</span></label>
                <input type="range" min={0} max={dur} step={0.1} value={start} onChange={(e) => { const v = Math.min(+e.target.value, end); setStart(v); seekTo(v) }} className="w-full" />
                {nudgeRow(nudgeStart)}
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('md_end')}: <span className="font-mono">{toClock(end)}</span></label>
                <input type="range" min={0} max={dur} step={0.1} value={end} onChange={(e) => { const v = Math.max(+e.target.value, start); setEnd(v); seekTo(v) }} className="w-full" />
                {nudgeRow(nudgeEnd)}
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
              <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-brand-300">
                <ToolIcon name="folder" className="w-4 h-4" />{t('md_load')}
              </button>
            </div>
          </>
        )}
        {/* unified privacy banner (same format as the other tools) */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('md_note_local')}</span>
        </div>
      </div>
    </ToolLayout>
  )
}
