'use client'

import { useState } from 'react'

function qrUrl(text: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=1`
}

/** Renders a QR image for `value` with a size selector and PNG download. */
export default function QrOutput({ value, filename = 'qr-code.png' }: { value: string; filename?: string }) {
  const [size, setSize] = useState(256)
  const [downloaded, setDownloaded] = useState(false)

  async function download() {
    const resp = await fetch(qrUrl(value, size))
    const blob = await resp.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  if (!value) return null

  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Size</label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {[128, 256, 512].map((s) => (
            <option key={s} value={s}>{s}×{s}px</option>
          ))}
        </select>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl(value, size)} alt="QR Code" width={size} height={size} className="rounded-xl border border-gray-200 shadow-sm max-w-full" />
      <button onClick={download} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
        {downloaded ? '✓ Downloaded' : '⬇ Download PNG'}
      </button>
    </div>
  )
}
