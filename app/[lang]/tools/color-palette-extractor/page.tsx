'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-palette-extractor')!

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()
}

function getPixelClusters(data: Uint8ClampedArray, count=8): [number,number,number][] {
  // simple median-cut style sampling
  const pixels: [number,number,number][] = []
  const step = Math.max(1, Math.floor(data.length/4/500))
  for (let i=0; i<data.length; i+=4*step) {
    const a = data[i+3]
    if (a < 128) continue
    pixels.push([data[i],data[i+1],data[i+2]])
  }
  if (!pixels.length) return []
  
  // k-means with k=count, 10 iterations
  let centroids = pixels.slice(0, count).map(p=>[...p] as [number,number,number])
  for (let iter=0; iter<10; iter++) {
    const clusters: [number,number,number][][] = Array(count).fill(null).map(()=>[])
    for (const px of pixels) {
      let minD = Infinity, best = 0
      for (let k=0; k<count; k++) {
        const d = Math.pow(px[0]-centroids[k][0],2)+Math.pow(px[1]-centroids[k][1],2)+Math.pow(px[2]-centroids[k][2],2)
        if (d < minD) { minD=d; best=k }
      }
      clusters[best].push(px)
    }
    centroids = clusters.map((c,i) => {
      if (!c.length) return centroids[i]
      const avg = c.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]] as [number,number,number],[0,0,0] as [number,number,number])
      return [Math.round(avg[0]/c.length),Math.round(avg[1]/c.length),Math.round(avg[2]/c.length)] as [number,number,number]
    })
  }
  return centroids
}

export default function ColorPaletteExtractorPage({ params }: { params: { lang: string } }) {
  const [palette, setPalette] = useState<string[]>([])
  const [preview, setPreview] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string|null>(null)
  const [count, setCount] = useState(8)
  const tracked = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function track() { if (!tracked.current) { trackToolUsed('color-palette-extractor'); tracked.current = true } }

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    track()
    setLoading(true)
    const url = URL.createObjectURL(file)
    setPreview(url)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const MAX = 200
      const scale = Math.min(1, MAX/Math.max(img.width,img.height))
      canvas.width = Math.round(img.width*scale)
      canvas.height = Math.round(img.height*scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0,0,canvas.width,canvas.height).data
      const clusters = getPixelClusters(data, count)
      setPalette(clusters.map(([r,g,b])=>rgbToHex(r,g,b)))
      setLoading(false)
    }
    img.src = url
  }, [count])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  async function copy(hex: string) {
    await navigator.clipboard.writeText(hex)
    trackToolCopy('color-palette-extractor')
    setCopied(hex); setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="block text-xs font-medium text-gray-600">Colors to extract:</label>
          <input type="number" value={count} min={2} max={16} onChange={e=>{setCount(parseInt(e.target.value)||8)}}
            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center" />
        </div>
        <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-300 transition-colors cursor-pointer"
          onClick={()=>document.getElementById('pal-file-input')?.click()}>
          <input id="pal-file-input" type="file" accept="image/*" onChange={onFile} className="hidden" />
          {preview ? (
            <img src={preview} alt="" className="max-h-40 mx-auto rounded-xl object-contain" />
          ) : (
            <div className="text-gray-400">
              <div className="text-3xl mb-2">\uD83C\uDFA8</div>
              <p className="text-sm">Drop an image or click to upload</p>
              <p className="text-xs mt-1">PNG, JPG, WebP, GIF</p>
            </div>
          )}
        </div>
        {loading && <p className="text-sm text-gray-500 text-center">Extracting colors...</p>}
        {palette.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {palette.map((hex,i)=>(
              <div key={i} onClick={()=>copy(hex)} className="cursor-pointer group text-center">
                <div className="h-12 rounded-xl mb-1 border border-black/10 transition-transform group-hover:scale-105" style={{background:hex}} />
                <p className="text-xs font-mono text-gray-600">{hex}</p>
                {copied===hex && <p className="text-xs text-brand-400">\u2713</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
