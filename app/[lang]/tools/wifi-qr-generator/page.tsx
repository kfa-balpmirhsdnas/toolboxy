'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import QrOutput from '@/components/tools/QrOutput'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('wifi-qr-generator')!

function esc(s: string) {
  return s.replace(/([\\;,:"])/g, '\\$1')
}

export default function WifiQrPage({ params }: { params: { lang: string } }) {
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [enc, setEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [hidden, setHidden] = useState(false)

  const payload = ssid
    ? `WIFI:T:${enc};S:${esc(ssid)};${enc === 'nopass' ? '' : `P:${esc(password)};`}${hidden ? 'H:true;' : ''};`
    : ''

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Network name (SSID)</label>
          <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyWiFi"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} disabled={enc === 'nopass'} placeholder="••••••••"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security</label>
            <select value={enc} onChange={(e) => setEnc(e.target.value as 'WPA' | 'WEP' | 'nopass')}
              className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /> Hidden network
        </label>

        <QrOutput value={payload} filename="wifi-qr.png" />
        {!ssid && <p className="text-xs text-gray-400 text-center">Enter your network name to generate the QR code.</p>}
      </div>

    </ToolLayout>
  )
}
