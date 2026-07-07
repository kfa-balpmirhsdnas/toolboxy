'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('image-to-pdf')!

type Item = { id: string; file: File; url: string }

function toPngBytes(file: File): Promise<{ bytes: Uint8Array; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      c.toBlob(async (blob) => {
        if (!blob) return reject(new Error('encode failed'))
        resolve({ bytes: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height })
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

export default function ImageToPdfPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<{ by: 'name' | 'date'; dir: 1 | -1 } | null>(null) // current sort (null = manual order)
  const [dragId, setDragId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<Item[]>([])
  itemsRef.current = items
  // long-press → drag: so a normal touch still scrolls the page
  const pressRef = useRef<{ id: string; x: number; y: number; timer: ReturnType<typeof setTimeout> | null; active: boolean } | null>(null)

  function add(list: FileList | null) {
    if (!list) return
    const imgs = Array.from(list).filter((x) => x.type.startsWith('image/')).map((f) => ({ id: uid(), file: f, url: URL.createObjectURL(f) }))
    if (!imgs.length) return
    setItems((prev) => [...prev, ...imgs]); setSort(null)
    trackToolUsed('image-to-pdf')
  }
  function remove(id: string) {
    setItems((prev) => { const it = prev.find((x) => x.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter((x) => x.id !== id) })
  }
  useEffect(() => () => { itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url)) }, []) // revoke all on unmount

  // Sort by name or date; clicking the active kind again flips the direction.
  function applySort(by: 'name' | 'date') {
    const dir: 1 | -1 = sort && sort.by === by ? (sort.dir === 1 ? -1 : 1) : 1
    setSort({ by, dir })
    setItems((prev) => [...prev].sort((a, b) => dir * (by === 'name'
      ? a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' })
      : a.file.lastModified - b.file.lastModified)))
  }

  // ---- drag-to-reorder (pointer events: works on touch + mouse) ----
  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    const timer = setTimeout(() => { if (pressRef.current) { pressRef.current.active = true; setDragId(id) } }, 280)
    pressRef.current = { id, x: e.clientX, y: e.clientY, timer, active: false }
  }
  const onGridPointerMove = (e: React.PointerEvent) => {
    const p = pressRef.current; if (!p) return
    if (!p.active) { if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 12 && p.timer) { clearTimeout(p.timer); pressRef.current = null } return } // moved first → it's a scroll
    e.preventDefault()
    const over = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-id]') as HTMLElement | null
    const overId = over?.dataset.id
    if (overId && overId !== p.id) {
      setItems((prev) => {
        const from = prev.findIndex((x) => x.id === p.id); const to = prev.findIndex((x) => x.id === overId)
        if (from < 0 || to < 0) return prev
        const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n
      })
      setSort(null)
    }
  }
  const endDrag = () => { const p = pressRef.current; if (p?.timer) clearTimeout(p.timer); pressRef.current = null; setDragId(null) }

  async function build() {
    if (!items.length) return
    setLoading(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      for (const { file } of items) {
        const { bytes, w, h } = await toPngBytes(file)
        const png = await pdf.embedPng(bytes)
        const page = pdf.addPage([w, h])
        page.drawImage(png, { x: 0, y: 0, width: w, height: h })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'images.pdf'
      a.click()
      trackToolDownload('image-to-pdf', 'pdf')
    } finally {
      setLoading(false)
    }
  }

  const sortChip = (by: 'name' | 'date', label: string) => {
    const active = sort?.by === by
    return (
      <button type="button" onClick={() => applySort(by)}
        className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ' + (active ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300')}>
        {label}{active && <span className="leading-none">{sort!.dir === 1 ? '↑' : '↓'}</span>}
      </button>
    )
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
          <p className="text-4xl mb-2">📄</p>
          <p className="text-sm font-medium text-gray-600">{t('itp_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('itp_pageorder')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-2.5">
            {/* sort + reorder hint */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-400 mr-0.5">{t('itp_sort')}</span>
              {sortChip('name', t('itp_sort_name'))}
              {sortChip('date', t('itp_sort_date'))}
              <span className="ml-auto text-[11px] text-gray-400">{t('itp_reorder')}</span>
            </div>

            <div onPointerMove={onGridPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
              className={'grid grid-cols-4 sm:grid-cols-6 gap-2 ' + (dragId ? 'touch-none select-none' : '')}>
              {items.map((it, i) => (
                <div key={it.id} data-id={it.id} onPointerDown={onPointerDown(it.id)}
                  className={'group relative rounded-lg ' + (dragId === it.id ? 'opacity-40 ring-2 ring-brand-400' : '') + (dragId ? '' : ' cursor-grab')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.url} alt={it.file.name}
                    className={'w-full h-16 object-cover rounded-lg border border-gray-200 bg-white transition-transform duration-150 origin-center ' + (dragId ? '' : 'group-hover:scale-[2.3] group-hover:z-30 group-hover:relative group-hover:shadow-2xl group-hover:border-brand-300')} />
                  {/* page number */}
                  <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/55 text-white text-[9px] font-bold leading-tight pointer-events-none">{i + 1}</span>
                  <button onClick={() => remove(it.id)} onPointerDown={(e) => e.stopPropagation()}
                    className="absolute -top-1.5 -right-1.5 z-20 bg-gray-800 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 inline-flex items-center justify-center" aria-label="remove"><ToolIcon name="x" className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <button onClick={build} disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {loading ? t('itp_building') : t('itp_create', { n: items.length })}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('itp_privacy')}</p>
      </div>

    </ToolLayout>
  )
}
