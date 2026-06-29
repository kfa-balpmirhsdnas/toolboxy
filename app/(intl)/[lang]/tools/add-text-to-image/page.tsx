'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('add-text-to-image')!
const EMOJIS = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '⭐', '😎', '🥳', '💯', '👀', '🙌']

interface El { id: number; type: 'text' | 'emoji'; value: string; x: number; y: number; size: number; color: string }

let nextId = 1

export default function AddTextToImagePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [nat, setNat] = useState({ w: 0, h: 0 })
  const [els, setEls] = useState<El[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [dispW, setDispW] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ id: number } | null>(null)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDispW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [src])

  function load(f: File) {
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => { setNat({ w: img.naturalWidth, h: img.naturalHeight }); setSrc(url); setEls([]); trackToolUsed('add-text-to-image') }
    img.src = url
  }

  function add(type: 'text' | 'emoji', value: string) {
    if (!value) return
    const el: El = { id: nextId++, type, value, x: 0.5, y: 0.5, size: type === 'emoji' ? 0.15 : 0.1, color: '#ffffff' }
    setEls((e) => [...e, el]); setSel(el.id)
    if (type === 'text') setText('')
  }

  function onMove(e: React.PointerEvent) {
    if (!drag.current || !boxRef.current) return
    const r = boxRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    setEls((list) => list.map((el) => (el.id === drag.current!.id ? { ...el, x, y } : el)))
  }

  function patch(id: number, p: Partial<El>) { setEls((list) => list.map((el) => (el.id === id ? { ...el, ...p } : el))) }
  function remove(id: number) { setEls((list) => list.filter((el) => el.id !== id)); setSel(null) }

  function download() {
    const c = document.createElement('canvas')
    c.width = nat.w; c.height = nat.h
    const ctx = c.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'
      for (const el of els) {
        const px = el.size * nat.w
        ctx.font = `bold ${px}px ${el.type === 'emoji' ? 'sans-serif' : 'Impact, "Arial Black", sans-serif'}`
        const X = el.x * nat.w, Y = el.y * nat.h
        if (el.type === 'text') {
          ctx.lineWidth = Math.max(2, px / 12); ctx.strokeStyle = '#000'; ctx.strokeText(el.value, X, Y)
          ctx.fillStyle = el.color
        } else {
          ctx.fillStyle = '#000'
        }
        ctx.fillText(el.value, X, Y)
      }
      c.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'image-with-text.png'; a.click()
        trackToolDownload('add-text-to-image', 'png')
      }, 'image/png')
    }
    img.src = src
  }

  const selected = els.find((e) => e.id === sel)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!src ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">✍️</p><p className="text-sm font-medium text-gray-600">{t('ati_drop')}</p>
          </div>
        ) : (
          <>
            <div ref={boxRef} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onClick={() => setSel(null)}
              className="relative select-none mx-auto bg-gray-100 rounded-xl overflow-hidden" style={{ maxWidth: '100%', width: 'fit-content' }}>
              <img ref={imgRef} src={src} alt="canvas" onLoad={(e) => setDispW(e.currentTarget.clientWidth)} className="block max-h-[60vh] w-auto pointer-events-none" />
              {els.map((el) => (
                <div key={el.id}
                  onPointerDown={(e) => { e.stopPropagation(); (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { id: el.id }; setSel(el.id) }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: 'absolute', left: `${el.x * 100}%`, top: `${el.y * 100}%`, transform: 'translate(-50%,-50%)',
                    fontSize: `${el.size * dispW}px`, color: el.type === 'text' ? el.color : undefined,
                    cursor: 'move', whiteSpace: 'nowrap', lineHeight: 1,
                    fontWeight: 800, fontFamily: el.type === 'emoji' ? 'sans-serif' : 'Impact, "Arial Black", sans-serif',
                    textShadow: el.type === 'text' ? '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000' : 'none',
                    outline: sel === el.id ? '2px dashed #6366f1' : 'none' }}
                  className="px-0.5"
                >{el.value}</div>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add('text', text)} placeholder={t('ati_ph')}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <button onClick={() => add('text', text)} className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">{t('ati_addtext')}</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((em) => <button key={em} onClick={() => add('emoji', em)} className="text-2xl hover:scale-110 transition-transform">{em}</button>)}
            </div>

            {selected && (
              <div className="rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-500">{t('ati_selected')}</span>
                <label className="text-xs text-gray-600 flex items-center gap-1">{t('ui_size')}
                  <input type="range" min={0.04} max={0.5} step={0.01} value={selected.size} onChange={(e) => patch(selected.id, { size: +e.target.value })} />
                </label>
                {selected.type === 'text' && <input type="color" value={selected.color} onChange={(e) => patch(selected.id, { color: e.target.value })} className="h-7 w-9 rounded border border-gray-200" />}
                <button onClick={() => remove(selected.id)} className="text-xs text-red-600 hover:underline">{t('ati_delete')}</button>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="download" className="w-4 h-4" />{t('ati_downloadpng')}</button>
              <button onClick={() => { setSrc(''); setEls([]) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('ati_changeimg')}</button>
            </div>
            <p className="text-xs text-gray-400">{t('ati_note')}</p>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
