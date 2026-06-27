'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import QrOutput from '@/components/tools/QrOutput'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('phone-qr-generator')!

export default function PhoneQrPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [mode, setMode] = useState<'call' | 'sms'>('call')
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  const clean = number.replace(/[^\d+]/g, '')
  const payload = !clean
    ? ''
    : mode === 'call'
      ? `tel:${clean}`
      : `SMSTO:${clean}${message ? ':' + message : ''}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['call', 'pqr_call'], ['sms', 'pqr_sms']] as ['call' | 'sms', string][]).map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                mode === id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{t(label)}</button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('pqr_number')}</label>
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="+1 555 123 4567"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        {mode === 'sms' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pqr_message')}</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Pre-filled text…"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        )}

        <QrOutput value={payload} filename="phone-qr.png" />
        {!clean && <p className="text-xs text-gray-400 text-center">{t('pqr_hint')}</p>}
      </div>

    </ToolLayout>
  )
}
