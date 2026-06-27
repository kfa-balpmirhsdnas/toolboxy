'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('vat-calculator')!

export default function VatCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [amount, setAmount] = useState('100')
  const [rate, setRate] = useState('10')
  const [mode, setMode] = useState<'add' | 'remove'>('add')

  const result = (() => {
    const a = +amount, r = +rate / 100
    if (!(a >= 0 && r >= 0)) return null
    if (mode === 'add') {
      const vat = a * r
      return { net: a, vat, gross: a + vat }
    }
    const net = a / (1 + r)
    return { net, vat: a - net, gross: a }
  })()

  const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['add', 'vat_add'], ['remove', 'vat_remove']] as ['add' | 'remove', string][]).map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                mode === id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{t(label)}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{mode === 'add' ? t('vat_net_amt') : t('vat_gross_amt')}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('vat_rate')}</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500">{t('vat_net')}</div><div className="font-bold text-gray-900">{money(result.net)}</div></div>
            <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500">{t('vat_vat')}</div><div className="font-bold text-brand-700">{money(result.vat)}</div></div>
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100"><div className="text-xs text-brand-600">{t('vat_gross')}</div><div className="font-bold text-brand-700">{money(result.gross)}</div></div>
          </div>
        )}
      </div>

    </ToolLayout>
  )
}
