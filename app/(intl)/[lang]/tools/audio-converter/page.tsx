'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { getFFmpeg } from '@/lib/ffmpeg'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('audio-converter')!

// Output formats → ffmpeg encode args (libmp3lame/libvorbis are in the shared core) + MIME.
const FORMATS: Record<string, { ext: string; mime: string; args: (i: string) => string[] }> = {
  mp3: { ext: 'mp3', mime: 'audio/mpeg', args: (i) => ['-i', i, '-c:a', 'libmp3lame', '-q:a', '2', 'out.mp3'] },
  wav: { ext: 'wav', mime: 'audio/wav', args: (i) => ['-i', i, 'out.wav'] },
  m4a: { ext: 'm4a', mime: 'audio/mp4', args: (i) => ['-i', i, '-c:a', 'aac', '-b:a', '192k', 'out.m4a'] },
  ogg: { ext: 'ogg', mime: 'audio/ogg', args: (i) => ['-i', i, '-c:a', 'libvorbis', '-q:a', '5', 'out.ogg'] },
}
const FMT_KEYS = ['mp3', 'wav', 'm4a', 'ogg']

export default function AudioConverterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [fmt, setFmt] = useState('mp3')
  const [status, setStatus] = useState<'' | 'loading' | 'processing'>('')
  const [outUrl, setOutUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) { setFile(f); setUrl(URL.createObjectURL(f)); setOutUrl(''); setError(''); trackToolUsed('audio-converter') }

  async function convert() {
    if (!file) return
    setStatus('loading'); setOutUrl(''); setError('')
    try {
      const { fetchFile } = await import('@ffmpeg/util')
      const ff = await getFFmpeg()
      setStatus('processing')
      const ext = (file.name.split('.').pop() || 'audio').toLowerCase()
      const inName = 'in.' + ext
      const f = FORMATS[fmt]
      await ff.writeFile(inName, await fetchFile(file))
      await ff.exec(f.args(inName))
      const data = await ff.readFile('out.' + f.ext)
      const blob = new Blob([data as unknown as BlobPart], { type: f.mime })
      setOutUrl(URL.createObjectURL(blob))
      trackToolDownload('audio-converter', f.ext)
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setStatus('')
    }
  }

  function download() {
    if (!outUrl || !file) return
    const a = document.createElement('a')
    a.href = outUrl; a.download = file.name.replace(/\.[^.]+$/, '') + '.' + FORMATS[fmt].ext; a.click()
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
            <audio src={url} controls className="w-full" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('ac_format')}</label>
              <div className="grid grid-cols-4 gap-2">
                {FMT_KEYS.map((k) => (
                  <button key={k} onClick={() => { setFmt(k); setOutUrl('') }} disabled={!!status}
                    className={'py-2 rounded-xl text-sm font-bold transition ' + (fmt === k ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{k.toUpperCase()}</button>
                ))}
              </div>
            </div>
            {status && <p className="text-sm text-brand-600 text-center">{status === 'loading' ? t('md_loading') : t('md_processing')}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            <div className="flex gap-2">
              {!outUrl ? (
                <button onClick={convert} disabled={!!status}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{t('ac_convert')}</button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')}</button>
              )}
              <button onClick={() => { setUrl(''); setFile(null); setOutUrl('') }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">↺</button>
            </div>
            {outUrl && <audio src={outUrl} controls className="w-full" />}
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_local')}</p>
      </div>
    </ToolLayout>
  )
}
