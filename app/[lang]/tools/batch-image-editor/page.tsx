'use client'

// All-in-One Batch Image Editor — pipelines the five batch tools over one upload.
// Reuses the shared engine and each tool's processing function; nothing duplicated.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { resizeImage, type ResizeMode, type ResizeAxis } from '@/lib/batch-image/resize'
import { convertImage, type OutFormat } from '@/lib/batch-image/convert'
import { compressImage } from '@/lib/batch-image/compress'
import { watermarkImage, type WatermarkType, type Position } from '@/lib/batch-image/watermark'
import { buildNewName, DEFAULT_RULES, type RenameRules } from '@/lib/batch-image/rename'

const tool = getToolBySlug('batch-image-editor')!
type ImgTask = 'resize' | 'convert' | 'compress' | 'watermark'
const TASK_EMOJI: Record<ImgTask, string> = { resize: '📐', convert: '🔄', compress: '🗜️', watermark: '🏷️' }
const POSITIONS: Position[] = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br']
const ARROWS: Record<Position, string> = { tl: '↖', tc: '↑', tr: '↗', ml: '←', mc: '●', mr: '→', bl: '↙', bc: '↓', br: '↘' }

const numCls = 'w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
const selCls = 'px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'
const seg = (active: boolean) => 'px-3 py-1 rounded-lg text-xs font-medium transition-colors ' + (active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')

export default function BatchImageEditorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [order, setOrder] = useState<ImgTask[]>(['resize', 'convert', 'compress', 'watermark'])
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setEnabled((e) => ({ ...e, [id]: !e[id] }))
  const dragId = useRef<ImgTask | null>(null)
  function reorder(target: ImgTask) {
    const from = dragId.current; dragId.current = null
    if (!from || from === target) return
    setOrder((prev) => { const a = prev.filter((x) => x !== from); a.splice(a.indexOf(target), 0, from); return a })
  }

  const [resize, setResize] = useState({ mode: 'maxside' as ResizeMode, axis: 'longest' as ResizeAxis, maxSide: '1920', width: '', height: '', keepRatio: true, percent: '50', quality: '85' })
  const [convert, setConvert] = useState({ format: 'webp' as OutFormat, quality: '90' })
  const [compress, setCompress] = useState({ quality: '70', useTarget: false, targetKB: '300' })
  const [wm, setWm] = useState({ type: 'text' as WatermarkType, text: '© ToolBoxy', fontPct: '5', color: '#ffffff', opacity: '60', position: 'br' as Position, logoScalePct: '20' })
  const [logo, setLogo] = useState<ImageBitmap | null>(null)
  const [logoName, setLogoName] = useState('')
  const [rn, setRn] = useState({ prefix: '', suffix: '', seq: false, seqStart: 1, seqDigits: 3, seqPos: 'back' as 'front' | 'back' })
  const logoRef = useRef<HTMLInputElement>(null)

  const up = <T,>(set: React.Dispatch<React.SetStateAction<T>>) => (patch: Partial<T>) => set((s) => ({ ...s, ...patch }))
  const upResize = up(setResize), upConvert = up(setConvert), upCompress = up(setCompress), upWm = up(setWm), upRn = up(setRn)

  async function onLogo(file?: File) {
    if (!file) return
    try { setLogo(await createImageBitmap(file)); setLogoName(file.name) } catch { setLogo(null); setLogoName('') }
  }

  // Pipeline: enabled image tasks in order (blob → File chaining), rename last.
  const processFn = useCallback<ProcessFn>(async (file, index) => {
    let cur = file
    for (const id of order) {
      if (!enabled[id]) continue
      let res: { blob: Blob; filename: string } | null = null
      if (id === 'resize') res = await resizeImage(cur, { mode: resize.mode, axis: resize.axis, width: Number(resize.width) || undefined, height: Number(resize.height) || undefined, keepRatio: resize.keepRatio, percent: Number(resize.percent) || 100, maxSide: Number(resize.maxSide) || 0, quality: Number(resize.quality) || 85 })
      else if (id === 'convert') res = await convertImage(cur, { format: convert.format, quality: Number(convert.quality) || 90 })
      else if (id === 'compress') res = await compressImage(cur, { quality: Number(compress.quality) || 70, targetKB: compress.useTarget ? Number(compress.targetKB) || undefined : undefined })
      else if (id === 'watermark') res = await watermarkImage(cur, { type: wm.type, opacity: Number(wm.opacity) || 60, position: wm.position, text: wm.text, fontPct: Number(wm.fontPct) || 5, color: wm.color, logo, logoScalePct: Number(wm.logoScalePct) || 20 })
      if (!res) return null
      cur = new File([res.blob], res.filename, { type: res.blob.type })
    }
    let filename = cur.name
    if (enabled.rename) {
      const rules: RenameRules = { ...DEFAULT_RULES, affixOn: !!(rn.prefix || rn.suffix), prefix: rn.prefix, suffix: rn.suffix, seqOn: rn.seq, seqStart: rn.seqStart, seqDigits: rn.seqDigits, seqPos: rn.seqPos }
      filename = buildNewName(cur.name, index, rules)
    }
    return { blob: cur, filename }
  }, [order, enabled, resize, convert, compress, wm, logo, rn])

  const enabledCount = order.filter((x) => enabled[x]).length + (enabled.rename ? 1 : 0)

  function options(id: ImgTask) {
    if (id === 'resize') return (
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex flex-wrap gap-1.5">
          {([['maxside', t('bie_m_longest')], ['dimensions', t('bie_m_dim')], ['percent', t('bie_m_ratio')]] as [ResizeMode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => upResize({ mode: m })} className={seg(resize.mode === m)}>{l}</button>
          ))}
        </div>
        {resize.mode === 'maxside' && <label className="flex items-center gap-2">{t('bie_m_longest')} <input type="number" min={1} value={resize.maxSide} onChange={(e) => upResize({ maxSide: e.target.value })} className={numCls} /> px</label>}
        {resize.mode === 'dimensions' && (
          <div className="flex flex-wrap items-center gap-2">W <input type="number" min={1} value={resize.width} onChange={(e) => upResize({ width: e.target.value })} className={numCls} />
            H <input type="number" min={1} value={resize.height} onChange={(e) => upResize({ height: e.target.value })} className={numCls} />
            <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={resize.keepRatio} onChange={(e) => upResize({ keepRatio: e.target.checked })} className="accent-brand-600" />{t('bir_keep_ratio')}</label>
          </div>
        )}
        {resize.mode === 'percent' && <label className="flex items-center gap-2">{t('bie_m_ratio')} <input type="range" min={1} max={200} value={resize.percent} onChange={(e) => upResize({ percent: e.target.value })} className="flex-1 accent-brand-600" /> <span className="w-10 text-right">{resize.percent}%</span></label>}
        <label className="flex items-center gap-2">{t('bir_quality')} <input type="range" min={1} max={100} value={resize.quality} onChange={(e) => upResize({ quality: e.target.value })} className="flex-1 accent-brand-600" /> <span className="w-10 text-right">{resize.quality}%</span></label>
      </div>
    )
    if (id === 'convert') return (
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex flex-wrap gap-1.5">
          {([['jpeg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']] as [OutFormat, string][]).map(([f, l]) => (
            <button key={f} onClick={() => upConvert({ format: f })} className={seg(convert.format === f)}>{l}</button>
          ))}
        </div>
        <label className={'flex items-center gap-2 ' + (convert.format === 'png' ? 'opacity-40 pointer-events-none' : '')}>{t('bir_quality')} <input type="range" min={1} max={100} value={convert.quality} onChange={(e) => upConvert({ quality: e.target.value })} disabled={convert.format === 'png'} className="flex-1 accent-brand-600" /> <span className="w-10 text-right">{convert.quality}%</span></label>
      </div>
    )
    if (id === 'compress') return (
      <div className="space-y-2 text-sm text-gray-700">
        <label className={'flex items-center gap-2 ' + (compress.useTarget ? 'opacity-40 pointer-events-none' : '')}>{t('bir_quality')} <input type="range" min={1} max={100} value={compress.quality} onChange={(e) => upCompress({ quality: e.target.value })} disabled={compress.useTarget} className="flex-1 accent-brand-600" /> <span className="w-10 text-right">{compress.quality}%</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={compress.useTarget} onChange={(e) => upCompress({ useTarget: e.target.checked })} className="accent-brand-600" />{t('bcp_target_size')}
          <input type="number" min={1} value={compress.targetKB} onChange={(e) => upCompress({ targetKB: e.target.value })} disabled={!compress.useTarget} className={numCls + (compress.useTarget ? '' : ' opacity-40')} /> {t('bcp_kb_each')}</label>
      </div>
    )
    return (
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex gap-1.5">
          {(['text', 'image'] as WatermarkType[]).map((tp) => <button key={tp} onClick={() => upWm({ type: tp })} className={seg(wm.type === tp)}>{tp === 'text' ? t('bwm_text') : t('bwm_logo')}</button>)}
        </div>
        {wm.type === 'text' ? (
          <div className="flex flex-wrap items-center gap-2">
            <input value={wm.text} onChange={(e) => upWm({ text: e.target.value })} className="px-2 py-1 border border-gray-200 rounded-lg text-sm flex-1 min-w-[8rem]" />
            <input type="color" value={wm.color} onChange={(e) => upWm({ color: e.target.value })} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
            <label className="flex items-center gap-1">{t('bwm_size')} <input type="range" min={1} max={20} value={wm.fontPct} onChange={(e) => upWm({ fontPct: e.target.value })} className="w-20 accent-brand-600" /></label>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
            <button onClick={() => logoRef.current?.click()} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200">{logoName ? t('bwm_change_logo') : t('bwm_upload_logo')}</button>
            <span className="text-xs text-gray-500 truncate">{logoName || t('bwm_no_logo')}</span>
            <label className="flex items-center gap-1">{t('bwm_size')} <input type="range" min={2} max={60} value={wm.logoScalePct} onChange={(e) => upWm({ logoScalePct: e.target.value })} className="w-16 accent-brand-600" /></label>
          </div>
        )}
        <label className="flex items-center gap-2">{t('bwm_opacity')} <input type="range" min={1} max={100} value={wm.opacity} onChange={(e) => upWm({ opacity: e.target.value })} className="flex-1 accent-brand-600" /> <span className="w-10 text-right">{wm.opacity}%</span></label>
        <div className="flex items-center gap-2"><span>{t('bwm_position')}</span>
          <div className="inline-grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
            {POSITIONS.map((p) => <button key={p} onClick={() => upWm({ position: p })} aria-label={p} className={'w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ' + (wm.position === p ? 'bg-brand-600 text-white' : 'bg-white text-gray-400 hover:bg-brand-100')}>{ARROWS[p]}</button>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <p className="text-sm text-gray-500">{t('bie_intro')}</p>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{t('bie_pipeline')}{enabledCount > 0 && <span className="ml-1 text-xs text-brand-600">({enabledCount})</span>}</p>
            <span className="text-xs text-gray-400">⠿ {t('bie_drag_hint')}</span>
          </div>

          {order.map((id) => {
            const on = !!enabled[id]
            const step = order.filter((x) => enabled[x]).indexOf(id) + 1
            return (
              <div key={id} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(id)} className="bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span draggable onDragStart={() => { dragId.current = id }} className="cursor-grab text-gray-300 select-none" title={t('bie_drag_hint')}>⠿</span>
                  <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={on} onChange={() => toggle(id)} className="accent-brand-600" />
                    {TASK_EMOJI[id]} {t(`bie_task_${id}`)}
                  </label>
                  {on && <span className="text-xs font-medium text-brand-600">{t('bie_step', { n: step })}</span>}
                </div>
                {on && <div className="px-3 pb-3 pt-1 border-t border-gray-100">{options(id)}</div>}
              </div>
            )
          })}

          {/* Rename — always applied last, not reorderable */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="w-4 text-center text-gray-300 select-none">·</span>
              <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm font-medium text-gray-700">
                <input type="checkbox" checked={!!enabled.rename} onChange={() => toggle('rename')} className="accent-brand-600" />
                ✏️ {t('bie_task_rename')}
              </label>
              <span className="text-xs text-gray-400">{t('bie_always_last')}</span>
            </div>
            {enabled.rename && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-2 text-sm text-gray-700">
                <div className="flex flex-wrap items-center gap-2">{t('brn_at_front')} <input value={rn.prefix} onChange={(e) => upRn({ prefix: e.target.value })} placeholder={t('brn_prefix')} className={numCls + ' w-24'} />
                  {t('brn_at_back')} <input value={rn.suffix} onChange={(e) => upRn({ suffix: e.target.value })} placeholder={t('brn_suffix')} className={numCls + ' w-24'} /></div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={rn.seq} onChange={(e) => upRn({ seq: e.target.checked })} className="accent-brand-600" />{t('brn_sequence')}</label>
                  <span className="text-gray-400">{t('brn_start')}</span><input type="number" value={rn.seqStart} onChange={(e) => upRn({ seqStart: Number(e.target.value) })} disabled={!rn.seq} className={numCls + ' w-16'} />
                  <span className="text-gray-400">{t('brn_digits')}</span><input type="number" min={1} value={rn.seqDigits} onChange={(e) => upRn({ seqDigits: Number(e.target.value) })} disabled={!rn.seq} className={numCls + ' w-14'} />
                  <select value={rn.seqPos} onChange={(e) => upRn({ seqPos: e.target.value as 'front' | 'back' })} disabled={!rn.seq} className={selCls}><option value="front">{t('brn_at_front')}</option><option value="back">{t('brn_at_back')}</option></select>
                </div>
              </div>
            )}
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-editor" processFn={processFn} zipBaseName="edited" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-editor" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
