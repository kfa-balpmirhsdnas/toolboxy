'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('circle-crop')!

export default function CircleCropPage({ params }: { params: { lang: string } }) {
  const [src, setSrc] = useState('')
  const [result, setResult] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    setSrc(URL.createObjectURL(f)); setResult(''); trackToolUsed('circle-crop')
    const img = new Image()
    img.onload = () => {
      const size = Math.min(img.naturalWidth, img.naturalHeight)
      const c = document.createElement('canvas')
      c.width = c.height = size
      const ctx = c.getContext('2d')!
      ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      ctx.drawImage(img, (img.naturalWidth - size) / 2, (img.naturalHeight - size) / 2, size, size, 0, 0, size, size)
      c.toBlob((blob) => blob && setResult(URL.createObjectURL(blob)), 'image/png')
    }
    img.src = URL.createObjectURL(f)
  }

  function download() {
    if (!result) return
    const a = document.createElement('a')
    a.href = result; a.download = 'circle-crop.png'; a.click()
    trackToolDownload('circle-crop', 'png')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!src ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">⭕</p><p className="text-sm font-medium text-gray-600">Drop an image or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">Cropped to a circle with transparent corners (PNG)</p>
          </div>
        ) : (
          <>
            {result && (
              <div className="flex justify-center bg-[conic-gradient(at_center,_#eee_25%,_#fff_0_50%,_#eee_0_75%,_#fff_0)] bg-[length:20px_20px] rounded-xl p-4">
                <img src={result} alt="circle" className="max-h-56" />
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button onClick={download} disabled={!result} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">⬇ Download PNG</button>
              <button onClick={() => { setSrc(''); setResult('') }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Change image</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">Processed entirely in your browser.</p>
      </div>
    </ToolLayout>
  )
}
