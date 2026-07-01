'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { getFFmpeg } from '@/lib/ffmpeg'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('video-to-audio')!

export default function VideoToAudioPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'' | 'loading' | 'processing'>('')
  const [outUrl, setOutUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function extract(f: File) {
    setFile(f); setOutUrl(''); setError('')
    setStatus('loading')
    trackToolUsed('video-to-audio')
    try {
      const { fetchFile } = await import('@ffmpeg/util')
      const ff = await getFFmpeg()
      setStatus('processing')
      const ext = (f.name.split('.').pop() || 'mp4').toLowerCase()
      await ff.writeFile('in.' + ext, await fetchFile(f))
      await ff.exec(['-i', 'in.' + ext, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', 'out.mp3'])
      const data = await ff.readFile('out.mp3')
      const blob = new Blob([data as Uint8Array], { type: 'audio/mpeg' })
      setOutUrl(URL.createObjectURL(blob))
      trackToolDownload('video-to-audio', 'mp3')
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setStatus('')
    }
  }

  function download() {
    if (!outUrl || !file) return
    const a = document.createElement('a')
    a.href = outUrl; a.download = file.name.replace(/\.[^.]+$/, '') + '.mp3'; a.click()
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && extract(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && extract(e.target.files[0])} />
          <p className="text-4xl mb-2">🎬→🎵</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('md_drop_video')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('md_extract')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {status && <p className="text-sm text-brand-600 text-center">{status === 'loading' ? t('md_loading') : t('md_extracting')}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {outUrl && (
          <div className="space-y-3 text-center">
            <audio src={outUrl} controls className="w-full" />
            <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')} MP3</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_browser')}</p>
      </div>
    </ToolLayout>
  )
}
