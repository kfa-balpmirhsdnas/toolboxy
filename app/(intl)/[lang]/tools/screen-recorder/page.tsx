'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('screen-recorder')!

export default function ScreenRecorderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [supported, setSupported] = useState<boolean | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia)
  }, [])

  async function start() {
    setError(''); setUrl('')
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setError(t('sr_unsupported'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((tk) => tk.stop())
        setRecording(false)
      }
      // user clicks the browser's "Stop sharing" -> end recording
      stream.getVideoTracks()[0].addEventListener('ended', () => rec.state !== 'inactive' && rec.stop())
      rec.start()
      recRef.current = rec
      setRecording(true)
      trackToolUsed('screen-recorder')
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? t('sr_cancelled') : t('sr_failed'))
    }
  }

  function stop() { recRef.current?.state !== 'inactive' && recRef.current?.stop() }

  function download() {
    if (!url) return
    const a = document.createElement('a')
    a.href = url; a.download = `screen-recording-${Date.now()}.webm`; a.click()
    trackToolDownload('screen-recorder', 'webm')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      {supported === false ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <div className="text-3xl mb-2">🖥️</div>
          <p className="text-sm font-medium text-amber-800">{t('sr_desktoponly')}</p>
          <p className="text-sm text-amber-700 mt-1">{t('sr_desktopdesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            {!recording ? (
              <button onClick={start} disabled={supported === null} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">{t('sr_start')}</button>
            ) : (
              <button onClick={stop} className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors animate-pulse">{t('sr_stop')}</button>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          {url && (
            <div className="space-y-3">
              <video src={url} controls className="w-full rounded-xl border border-gray-200 bg-black" />
              <button onClick={download} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ {t('sr_download')}</button>
            </div>
          )}
          <p className="text-xs text-gray-400">{t('sr_note')}</p>
        </div>
      )}
    </ToolLayout>
  )
}
