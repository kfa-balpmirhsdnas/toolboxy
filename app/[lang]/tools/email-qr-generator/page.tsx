'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import QrOutput from '@/components/tools/QrOutput'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('email-qr-generator')!

export default function EmailQrPage({ params }: { params: { lang: string } }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const q = new URLSearchParams()
  if (subject) q.set('subject', subject)
  if (body) q.set('body', body)
  const qs = q.toString()
  const payload = to ? `mailto:${to}${qs ? '?' + qs : ''}` : ''

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To (email address)</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="hello@example.com"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hello"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body (optional)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Message…"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <QrOutput value={payload} filename="email-qr.png" />
        {!to && <p className="text-xs text-gray-400 text-center">Enter an email address to generate the QR code.</p>}
      </div>

      <ToolFaq slug="email-qr-generator" />
    </ToolLayout>
  )
}
