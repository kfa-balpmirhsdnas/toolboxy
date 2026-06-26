'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('pixel-to-rem-converter')!

export default function PixelToRemConverterPage() {
  const t = useTranslations('toolui')
  const [pxVal, setPxVal] = useState('')
  const [remVal, setRemVal] = useState('')
  const [emVal, setEmVal] = useState('')
  const [base, setBase] = useState(16)
  const [copied, setCopied] = useState('')

  const fromPx = (v: string) => {
    setPxVal(v)
    const n = parseFloat(v)
    if (!isNaN(n) && base > 0) {
      setRemVal((n / base).toFixed(4))
      setEmVal((n / base).toFixed(4))
    } else { setRemVal(''); setEmVal('') }
  }

  const fromRem = (v: string) => {
    setRemVal(v)
    const n = parseFloat(v)
    if (!isNaN(n) && base > 0) {
      setPxVal((n * base).toFixed(2))
      setEmVal(v)
    } else { setPxVal(''); setEmVal('') }
  }

  const copy = (val: string, field: string) => {
    navigator.clipboard.writeText(val)
    setCopied(field)
    setTimeout(() => setCopied(''), 1500)
  }

  const commonPx = [8, 12, 14, 16, 18, 20, 24, 32, 48, 64]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('px_base')}</label>
          <input type="number" value={base} onChange={e => setBase(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm" min={1} />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('px_pixels')}</label>
            <div className="flex gap-2">
              <input value={pxVal} onChange={e => fromPx(e.target.value)} placeholder="e.g. 16"
                className="flex-1 border rounded px-3 py-2 text-sm" />
              <button onClick={() => copy(pxVal, 'px')} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                {copied === 'px' ? t('ui_copied') : t('ui_copy')}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">REM</label>
            <div className="flex gap-2">
              <input value={remVal} onChange={e => fromRem(e.target.value)} placeholder="e.g. 1"
                className="flex-1 border rounded px-3 py-2 text-sm" />
              <button onClick={() => copy(remVal, 'rem')} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                {copied === 'rem' ? t('ui_copied') : t('ui_copy')}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EM</label>
            <div className="flex gap-2">
              <input value={emVal} readOnly className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50" />
              <button onClick={() => copy(emVal, 'em')} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                {copied === 'em' ? t('ui_copied') : t('ui_copy')}
              </button>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t('ptr_quickref',{b:base})}</p>
          <div className="flex flex-wrap gap-2">
            {commonPx.map(px => (
              <button key={px} onClick={() => fromPx(String(px))}
                className="px-3 py-1 border rounded text-sm hover:bg-indigo-50">
                {px}px = {(px / base).toFixed(3)}rem
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}