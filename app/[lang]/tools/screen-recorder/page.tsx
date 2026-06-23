'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('screen-recorder')!

export default function ScreenRecorderPage({ params }: { params: { lang: string } }) {
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  async function start() {
    setError(''); setUrl('')
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        setRecording(false)
      }
      // user clicks the browser's "Stop sharing" -> end recording
      stream.getVideoTracks()[0].addEventListener('ended', () => rec.state !== 'inactive' && rec.stop())
      rec.start()
      recRef.current = rec
      setRecording(true)
      trackToolUsed('screen-recorder')
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Screen sharing was cancelled or blocked.' : 'Could not start screen recording.')
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
      <div className="space-y-4">
        <div className="flex gap-3">
          {!recording ? (
            <button onClick={start} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">● Start recording</button>
          ) : (
            <button onClick={stop} className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors animate-pulse">■ Stop recording</button>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {url && (
          <div className="space-y-3">
            <video src={url} controls className="w-full rounded-xl border border-gray-200 bg-black" />
            <button onClick={download} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ Download .webm</button>
          </div>
        )}
        <p className="text-xs text-gray-400">Records your screen (and system/mic audio if allowed) to a WebM file, entirely in your browser. Nothing is uploaded.</p>
      </div>

      <ToolFaq slug="screen-recorder" />
    </ToolLayout>
  )
}
