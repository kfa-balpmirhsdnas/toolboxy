'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('csv-to-excel')!

export default function CsvToExcelPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isExcel = file ? /\.(xlsx|xls)$/i.test(file.name) : false

  function pick(f: File | undefined | null) { if (!f) return; setError(''); setFile(f) }

  async function convert() {
    if (!file) return
    setBusy(true); setError(''); trackToolUsed('csv-to-excel')
    try {
      const XLSX = await import('xlsx')
      let blob: Blob, name: string
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' })
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
        blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }) // BOM so Excel reads UTF-8
        name = file.name.replace(/\.(xlsx|xls)$/i, '.csv')
      } else {
        const wb = XLSX.read(await file.text(), { type: 'string' })
        const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        name = file.name.replace(/\.csv$/i, '') + '.xlsx'
      }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
      trackToolDownload('csv-to-excel', isExcel ? 'csv' : 'xlsx')
    } catch (e) { console.error(e); setError(t('cx_error')) } finally { setBusy(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cx_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cx_subtitle')}</p>
        </div>

        <div onClick={() => document.getElementById('cx-file')?.click()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input id="cx-file" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
          <p className="text-4xl mb-2">📊</p><p className="text-sm font-medium text-gray-600">{file ? file.name : t('cx_drop')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); document.getElementById('cx-file')?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {file && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700 text-center">
            {isExcel ? t('cx_to_csv') : t('cx_to_excel')}
          </div>
        )}
        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}

        {file && (
          <button onClick={convert} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? '…' : t('cx_convert')}</button>
        )}
        <p className="text-xs text-gray-400">{t('cx_note')}</p>
      </div>
    </ToolLayout>
  )
}
