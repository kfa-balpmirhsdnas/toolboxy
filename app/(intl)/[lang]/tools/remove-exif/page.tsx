'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import { getToolBySlug } from '@/lib/tools/registry'
import { readExif, stripImageMeta } from '@/lib/exif'

const tool = getToolBySlug('remove-exif')!

type Scan = { name: string; gps: boolean; camera: boolean; date: boolean; any: boolean }

export default function RemoveExifPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [mode, setMode] = useState<'all' | 'gps'>('all')
  const [scans, setScans] = useState<Scan[]>([])

  // Read EXIF of every queued file so we can warn (especially about GPS) before stripping.
  const onFilesChange = useCallback((files: File[]) => {
    if (!files.length) { setScans([]); return }
    let cancelled = false
    ;(async () => {
      const out: Scan[] = []
      for (const f of files) {
        const ex = await readExif(f)
        out.push({ name: f.name, gps: !!ex.gps, camera: !!ex.camera, date: !!ex.date, any: !!(ex.gps || ex.camera || ex.date || ex.iso || ex.aperture) })
      }
      if (!cancelled) setScans(out)
    })()
    return () => { cancelled = true }
  }, [])

  // Strip metadata at the byte level — pixels are never re-encoded.
  const processFn = useCallback<ProcessFn>(async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const out = stripImageMeta(bytes, mode) ?? bytes
    return { blob: new Blob([out as BlobPart], { type: file.type || 'image/jpeg' }), filename: file.name }
  }, [mode])

  const gpsCount = scans.filter((s) => s.gps).length
  const metaCount = scans.filter((s) => s.any).length

  // "What to strip" selector — rendered just above the process button (after the file list).
  const modeSelector = (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1.5">{t('rx_mode')}</p>
      <div className="grid grid-cols-2 gap-2">
        {(['all', 'gps'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={'text-left rounded-xl border px-3 py-2.5 transition-colors ' + (mode === m ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300')}>
            <span className={'block text-sm font-semibold ' + (mode === m ? 'text-brand-700' : 'text-gray-800')}>{t(m === 'all' ? 'rx_mode_all' : 'rx_mode_gps')}</span>
            <span className="block text-xs text-gray-500 mt-0.5">{t(m === 'all' ? 'rx_mode_all_d' : 'rx_mode_gps_d')}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // Replaces the list's "new size" column (barely changes here) with a "Metadata" column that
  // tags what each photo carries — GPS / camera / date — same badges as before, now in-column.
  const metaColumn = {
    header: t('rx_col_meta'),
    cell: (file: File) => {
      const s = scans.find((x) => x.name === file.name)
      if (!s) return <span className="text-gray-300">…</span>
      if (!s.any) return <span className="text-gray-300">—</span>
      return (
        <div className="flex flex-wrap justify-end gap-1 text-[10px] font-normal">
          {s.gps && <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 font-medium">⚠️{t('rx_tag_gps')}</span>}
          {s.camera && <span className="rounded bg-gray-100 text-gray-600 px-1.5 py-0.5">{t('rx_tag_camera')}</span>}
          {s.date && <span className="rounded bg-gray-100 text-gray-600 px-1.5 py-0.5">{t('rx_tag_date')}</span>}
        </div>
      )
    },
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Tool name lives in ToolLayout's header; the description moved to the How-to section. */}

        {/* Privacy banner — same wording as image-mosaic; this tool handles sensitive photos */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('im_privacy_title')}</b> {t('im_privacy')}</span>
        </div>

        {/* Detected-metadata summary / GPS warning (per-file tags now live in the list below) */}
        {scans.length > 0 && (
          gpsCount > 0 ? (
            <p className="text-sm rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">
              ⚠️ {t('rx_gps_warn', { n: gpsCount })}
            </p>
          ) : metaCount > 0 ? (
            <p className="text-sm rounded-xl bg-gray-50 border border-gray-200 text-gray-600 px-3 py-2">
              {t('rx_meta_found', { n: metaCount })}
            </p>
          ) : (
            <p className="text-sm rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2">
              {t('rx_no_meta')}
            </p>
          )
        )}

        {/* Upload + process + download (shared batch engine; strips at byte level).
            Per-file EXIF tags render inline via rowExtra — no separate list. */}
        <BatchImageProcessor slug="remove-exif" processFn={processFn} zipBaseName="no-exif"
          accept="image/jpeg,image/png" onFilesChange={onFilesChange}
          newColumn={metaColumn} hideOrigColMobile hidePrivacyBadge aboveCta={modeSelector} ctaLabel={(n) => t('rx_cta', { n })} />

        {/* Privacy emphasis (privacy tool) */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 space-y-1">
          <p className="font-semibold">🔒 {t('rx_privacy_title')}</p>
          <p>{t('rx_privacy_1')}</p>
          <p>{t('rx_privacy_2')}</p>
        </div>
      </div>
    </ToolLayout>
  )
}
