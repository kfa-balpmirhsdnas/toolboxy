'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import QrOutput from '@/components/tools/QrOutput'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('vcard-qr-generator')!

export default function VcardQrPage({ params }: { params: { lang: string } }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [url, setUrl] = useState('')

  const payload = (name || phone || email)
    ? ['BEGIN:VCARD', 'VERSION:3.0',
       name && `FN:${name}`,
       org && `ORG:${org}`,
       phone && `TEL;TYPE=CELL:${phone}`,
       email && `EMAIL:${email}`,
       url && `URL:${url}`,
       'END:VCARD'].filter(Boolean).join('\n')
    : ''

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {field('Full name', name, setName, 'Jane Doe')}
        <div className="flex gap-3">
          <div className="flex-1">{field('Phone', phone, setPhone, '+1 555 123 4567')}</div>
          <div className="flex-1">{field('Email', email, setEmail, 'jane@example.com')}</div>
        </div>
        {field('Organization', org, setOrg, 'Company (optional)')}
        {field('Website', url, setUrl, 'https://example.com (optional)')}

        <QrOutput value={payload} filename="contact-qr.png" />
        {!payload && <p className="text-xs text-gray-400 text-center">Fill in a name, phone or email to generate the contact QR.</p>}
      </div>

      <ToolFaq slug="vcard-qr-generator" />
    </ToolLayout>
  )
}
