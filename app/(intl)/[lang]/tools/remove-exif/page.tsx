'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import { getToolBySlug } from '@/lib/tools/registry'
import { readExif, stripImageMeta } from '@/lib/exif'

const tool = getToolBySlug('remove-exif')!

type Scan = { name: string; gps: boolean; camera: boolean; date?: string; any: boolean }

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
        out.push({ name: f.name, gps: !!ex.gps, camera: !!ex.camera, date: ex.date, any: !!(ex.gps || ex.camera || ex.date || ex.iso || ex.aperture) })
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

  // Per-file EXIF presence tags under the filename (GPS/camera; the shot date has its own column).
  const rowExtra = useCallback((file: File) => {
    const s = scans.find((x) => x.name === file.name)
    if (!s) return null
    return (
      <div className="flex flex-wrap items-center gap-1 text-[10px]">
        {s.gps && <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 font-medium">⚠️ {t('rx_tag_gps')}</span>}
        {s.camera && <span className="rounded bg-gray-100 text-gray-600 px-1.5 py-0.5">{t('rx_tag_camera')}</span>}
        {!s.any && <span className="text-gray-400">{t('rx_tag_clean')}</span>}
      </div>
    )
  }, [scans, t])

  // Replaces the list's "new size" column with the shot date (more useful here than the
  // barely-changed output size). YYYY-MM-DD only; "—" when the photo has no date.
  const dateColumn = {
    header: t('rx_col_taken'),
    cell: (file: File) => {
      const d = scans.find((x) => x.name === file.name)?.date
      return d ? <span className="text-gray-700">{d.slice(0, 10)}</span> : <span className="text-gray-300">—</span>
    },
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Tool name lives in ToolLayout's header; the description moved to the How-to section. */}

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
          accept="image/jpeg,image/png" onFilesChange={onFilesChange} rowExtra={rowExtra}
          newColumn={dateColumn} aboveCta={modeSelector} ctaLabel={(n) => t('rx_cta', { n })} />

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
