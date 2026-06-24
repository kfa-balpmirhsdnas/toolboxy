'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('rotate-image')!

export default function RotateImagePage({ params }: { params: { lang: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [src, setSrc] = useState('')
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) { setFile(f); setSrc(URL.createObjectURL(f)); setRotation(0); setFlipH(false); setFlipV(false); trackToolUsed('rotate-image') }

  function download() {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      const swap = rotation % 180 !== 0
      const c = document.createElement('canvas')
      c.width = swap ? img.naturalHeight : img.naturalWidth
      c.height = swap ? img.naturalWidth : img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.translate(c.width / 2, c.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      c.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = (file?.name.replace(/\.[^.]+$/, '') || 'image') + '-edited.png'
        a.click()
        trackToolDownload('rotate-image', 'png')
      }, 'image/png')
    }
    img.src = src
  }

  const transform = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!src ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🖼</p><p className="text-sm font-medium text-gray-600">Drop an image or click to upload</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4 min-h-[12rem] overflow-hidden">
              <img src={src} alt="preview" style={{ transform }} className="max-h-56 transition-transform" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setRotation((r) => (r + 270) % 360)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-brand-400">↺ Left</button>
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-brand-400">↻ Right</button>
              <button onClick={() => setFlipH((v) => !v)} className={`px-3 py-1.5 text-sm rounded-lg border ${flipH ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 hover:border-brand-400'}`}>⇆ Flip H</button>
              <button onClick={() => setFlipV((v) => !v)} className={`px-3 py-1.5 text-sm rounded-lg border ${flipV ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 hover:border-brand-400'}`}>⇅ Flip V</button>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ Download PNG</button>
              <button onClick={() => { setSrc(''); setFile(null) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Change image</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">Processed entirely in your browser.</p>
      </div>
    </ToolLayout>
  )
}
