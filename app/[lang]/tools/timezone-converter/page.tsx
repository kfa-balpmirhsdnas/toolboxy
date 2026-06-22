'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('timezone-converter')!

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Jakarta',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

function formatInTz(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(date)
  } catch {
    return 'N/A'
  }
}

function getOffset(date: Date, tz: string): string {
  try {
    const utcStr = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'shortOffset' }).format(date)
    const tzStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'shortOffset' }).format(date)
    const utcMs = new Date(utcStr.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')).getTime()
    const tzMs = new Date(tzStr.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')).getTime()
    const diffMin = Math.round((tzMs - utcMs) / 60000)
    const sign = diffMin >= 0 ? '+' : '-'
    const abs = Math.abs(diffMin)
    return 'UTC' + sign + String(Math.floor(abs / 60)).padStart(2, '0') + ':' + String(abs % 60).padStart(2, '0')
  } catch { return '' }
}

export default function TimezoneConverterPage({ params }: { params: { lang: string } }) {
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState('America/New_York')
  const [datetime, setDatetime] = useState('')
  const [result, setResult] = useState('')
  const [allZones, setAllZones] = useState<{ tz: string; time: string }[]>([])
  const [tracked] = useState(() => ({ val: false }))

  useEffect(() => {
    const now = new Date()
    // local datetime-local format
    const pad = (n: number) => String(n).padStart(2, '0')
    const localStr = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes())
    setDatetime(localStr)
  }, [])

  function convert() {
    if (!datetime) return
    if (!tracked.val) { trackToolUsed('timezone-converter'); tracked.val = true }
    try {
      // Parse datetime as from timezone
      // We use Intl to compute the date in fromTz, then convert to toTz
      const [datePart, timePart] = datetime.split('T')
      const [y, mo, d] = datePart.split('-').map(Number)
      const [h, mi] = timePart.split(':').map(Number)
      // Create a date that represents this time in fromTz
      // Strategy: assume the datetime-local input is in fromTz, find the UTC equivalent
      const approxDate = new Date(Date.UTC(y, mo - 1, d, h, mi, 0))
      // Get offset of fromTz at this time
      const fmt = (dt: Date) => new Intl.DateTimeFormat('en-CA', {
        timeZone: fromTz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(dt).replace(',', '')
      // Binary search or simple: compute the offset by comparing formatted local to UTC
      const localFormatted = new Intl.DateTimeFormat('en-CA', {
        timeZone: fromTz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).format(approxDate)
      const [localDate, localTime] = localFormatted.split(', ')
      const [ly, lm, ld] = localDate.split('-').map(Number)
      const [lh, lmi] = localTime.split(':').map(Number)
      const diffMs = Date.UTC(y, mo - 1, d, h, mi) - Date.UTC(ly, lm - 1, ld, lh, lmi)
      const actualUtc = new Date(approxDate.getTime() + diffMs)
      setResult(formatInTz(actualUtc, toTz))
      setAllZones(TIMEZONES.slice(0, 12).map(tz => ({ tz, time: formatInTz(actualUtc, tz) })))
    } catch (e: unknown) {
      setResult('Error: ' + (e as Error).message)
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Timezone</label>
            <select value={fromTz} onChange={e => setFromTz(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Timezone</label>
            <select value={toTz} onChange={e => setToTz(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
        <button onClick={convert} disabled={!datetime} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          Convert
        </button>
        {result && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
            <p className="text-xs text-brand-600 font-medium mb-1">{toTz}</p>
            <p className="text-2xl font-bold font-mono text-brand-900">{result}</p>
          </div>
        )}
        {allZones.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">World Clock</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allZones.map(({ tz, time }) => (
                <div key={tz} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <span className="text-gray-600 text-xs">{tz.replace('_', ' ')}</span>
                  <span className="font-mono text-gray-800 text-xs">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
