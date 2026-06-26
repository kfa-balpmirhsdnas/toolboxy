'use client'
import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('image-crop')!

function fmtBytes(b: number) {
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(2) + ' MB'
}

export default function ImageCropPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [imgSrc, setImgSrc] = useState('')
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  const [resultUrl, setResultUrl] = useState('')
  const [resultSize, setResultSize] = useState(0)
  const [origFile, setOrigFile] = useState<File|null>(null)
  const tracked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFile(file: File) {
    if (!tracked.current) { trackToolUsed('image-crop'); tracked.current = true }
    setOrigFile(file)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setNaturalW(img.naturalWidth)
      setNaturalH(img.naturalHeight)
      setX(0)
      setY(0)
      setW(img.naturalWidth)
      setH(img.naturalHeight)
    }
    img.src = url
    setImgSrc(url)
    setResultUrl('')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) handleFile(f)
  }

  function crop() {
    if (!imgSrc || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
      canvas.toBlob(blob => {
        if (!blob) return
        setResultUrl(URL.createObjectURL(blob))
        setResultSize(blob.size)
      }, 'image/png')
    }
    img.src = imgSrc
  }

  function download() {
    if (!resultUrl || !origFile) return
    const name = origFile.name.replace(/\.[^.]+$/, '') + '_cropped.png'
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = name
    a.click()
    trackToolDownload('image-crop', 'png')
  }

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {origFile ? (
            <p className="text-sm font-medium text-gray-700">{origFile.name} — {naturalW}x{naturalH}px</p>
          ) : (
            <>
              <p className="text-3xl mb-1">✂️</p>
              <p className="text-sm font-medium text-gray-600">{t('wc_drop')}</p>
            </>
          )}
        </div>
        {naturalW > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {([['ic_x', x, setX, 0, naturalW-1], ['ic_y', y, setY, 0, naturalH-1], ['ui_width', w, setW, 1, naturalW-x], ['ui_height', h, setH, 1, naturalH-y]] as [string,number,(v:number)=>void,number,number][]).map(([label, val, setter, min, max]) => (
              <div key={label as string}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t(label as string)}: {val as number}px</label>
                <input type="number" min={min as number} max={max as number} value={val as number}
                  onChange={e => (setter as (v:number)=>void)(clamp(parseInt(e.target.value)||0, min as number, max as number))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            ))}
          </div>
        )}
        {naturalW > 0 && (
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">{t('ic_output')}: <span className="font-mono font-semibold text-gray-700">{w}x{h}px</span></p>
            <button onClick={() => { setX(0); setY(0); setW(naturalW); setH(naturalH) }}
              className="text-xs text-brand-600 hover:underline">{t('ic_reset')}</button>
          </div>
        )}
        {imgSrc && (
          <div className="relative overflow-hidden rounded-xl border border-gray-200 max-h-48">
            <img src={imgSrc} alt="preview" className="w-full object-contain max-h-48" />
            <div className="absolute inset-0 bg-black/30 pointer-events-none"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ' +
                (x/naturalW*100) + '% ' + (y/naturalH*100) + '%, ' +
                ((x+w)/naturalW*100) + '% ' + (y/naturalH*100) + '%, ' +
                ((x+w)/naturalW*100) + '% ' + ((y+h)/naturalH*100) + '%, ' +
                (x/naturalW*100) + '% ' + ((y+h)/naturalH*100) + '%, ' +
                (x/naturalW*100) + '% ' + (y/naturalH*100) + '%)' }} />
          </div>
        )}
        <button onClick={crop} disabled={!imgSrc || w <= 0 || h <= 0}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {t('ic_crop')}
        </button>
        {resultUrl && (
          <div className="space-y-3">
            <img src={resultUrl} alt="cropped" className="max-h-40 rounded-xl border border-gray-200 object-contain mx-auto" />
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-sm text-green-800 font-medium">{w}x{h}px — {fmtBytes(resultSize)}</span>
              <button onClick={download} className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
                &#x2B07; {t('ui_download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
