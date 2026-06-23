'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('webcam-test')!

export default function WebcamTestPage({ params }: { params: { lang: string } }) {
  const [on, setOn] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState<{ label: string; w: number; h: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function start() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      const track = stream.getVideoTracks()[0]
      const s = track.getSettings()
      setInfo({ label: track.label, w: s.width || 0, h: s.height || 0 })
      setOn(true)
      trackToolUsed('webcam-test')
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Camera access was blocked. Allow it in your browser to test.' : 'No camera found or it is in use by another app.')
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setOn(false); setInfo(null)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="aspect-video w-full rounded-xl border border-gray-200 bg-gray-900 overflow-hidden flex items-center justify-center">
          <video ref={videoRef} muted playsInline className={`w-full h-full object-contain ${on ? '' : 'hidden'}`} />
          {!on && <span className="text-gray-500 text-sm">Camera preview will appear here</span>}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {info && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
            ✓ Camera working — <span className="font-semibold">{info.w}×{info.h}</span>{info.label ? ` · ${info.label}` : ''}
          </div>
        )}

        <div className="flex gap-3">
          {!on ? (
            <button onClick={start} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">Test my camera</button>
          ) : (
            <button onClick={stop} className="px-6 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors">Stop camera</button>
          )}
        </div>
        <p className="text-xs text-gray-400">The preview stays on your device — nothing is recorded or uploaded.</p>
      </div>

      <ToolFaq slug="webcam-test" />
    </ToolLayout>
  )
}
