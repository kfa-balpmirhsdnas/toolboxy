'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('voice-recorder')!

export default function VoiceRecorderPage({ params }: { params: { lang: string } }) {
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function start() {
    setError(''); setUrl(''); setSeconds(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        setUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: 'audio/webm' })))
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        setRecording(false)
      }
      rec.start()
      recRef.current = rec
      setRecording(true)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      trackToolUsed('voice-recorder')
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it to record.' : 'No microphone found.')
    }
  }

  function stop() { recRef.current?.state !== 'inactive' && recRef.current?.stop() }

  function download() {
    if (!url) return
    const a = document.createElement('a')
    a.href = url; a.download = `recording-${Date.now()}.webm`; a.click()
    trackToolDownload('voice-recorder', 'webm')
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4 text-center">
        <div className="text-5xl font-bold text-gray-900 tabular-nums">{mmss}</div>
        <div className="flex gap-3 justify-center">
          {!recording ? (
            <button onClick={start} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">● Start recording</button>
          ) : (
            <button onClick={stop} className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors animate-pulse">■ Stop</button>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {url && (
          <div className="space-y-3">
            <audio src={url} controls className="w-full" />
            <button onClick={download} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ Download audio</button>
          </div>
        )}
        <p className="text-xs text-gray-400">Records from your microphone to an audio file in your browser. Nothing is uploaded.</p>
      </div>

      <ToolFaq slug="voice-recorder" />
    </ToolLayout>
  )
}
