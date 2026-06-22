'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('unix-timestamp')!

function pad(n: number) { return String(n).padStart(2, '0') }
function toLocal(d: Date) {
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
}
function toUTC(d: Date) {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth()+1) + '-' + pad(d.getUTCDate()) + ' ' +
    pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC'
}
function toISO(d: Date) { return d.toISOString() }
function toRelative(d: Date): string {
  const diff = Math.round((d.getTime() - Date.now()) / 1000)
  const abs = Math.abs(diff)
  const suffix = diff >= 0 ? 'from now' : 'ago'
  if (abs < 60) return abs + ' seconds ' + suffix
  if (abs < 3600) return Math.floor(abs/60) + ' minutes ' + suffix
  if (abs < 86400) return Math.floor(abs/3600) + ' hours ' + suffix
  if (abs < 2592000) return Math.floor(abs/86400) + ' days ' + suffix
  if (abs < 31536000) return Math.floor(abs/2592000) + ' months ' + suffix
  return Math.floor(abs/31536000) + ' years ' + suffix
}

export default function UnixTimestampPage({ params }: { params: { lang: string } }) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [ts, setTs] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function track() {
    if (!tracked.current) { trackToolUsed('unix-timestamp'); tracked.current = true }
  }

  // Timestamp → Date
  const tsDate = ts.trim() ? new Date(parseInt(ts.trim()) * (ts.trim().length >= 13 ? 1 : 1000)) : null
  const tsValid = tsDate && !isNaN(tsDate.getTime())

  // Date → Timestamp
  const dateTs = dateInput ? Math.floor(new Date(dateInput).getTime() / 1000) : null
  const dateValid = dateTs && !isNaN(dateTs)

  async function copy(val: string, key: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('unix-timestamp')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function Row({ label, val, k }: { label: string; val: string; k: string }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
        <span className="text-sm font-mono text-gray-800 flex-1 mx-2 break-all">{val}</span>
        <button onClick={() => copy(val, k)} className="text-xs text-brand-600 hover:underline shrink-0">
          {copied===k ? '✓' : 'Copy'}
        </button>
      </div>
    )
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Live clock */}
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-600 font-medium mb-0.5">Current Unix Timestamp</p>
            <p className="text-2xl font-bold font-mono text-brand-900">{now}</p>
          </div>
          <button onClick={() => { setTs(String(now)); track() }}
            className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700">
            Use Current
          </button>
        </div>

        {/* Timestamp → Date */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Timestamp → Human Date</h3>
          <input
            value={ts}
            onChange={e => { setTs(e.target.value); track() }}
            placeholder="e.g. 1700000000 or 1700000000000 (ms)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {tsValid && tsDate && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0">
              <Row label="Local" val={toLocal(tsDate)} k="local" />
              <Row label="UTC" val={toUTC(tsDate)} k="utc" />
              <Row label="ISO 8601" val={toISO(tsDate)} k="iso" />
              <Row label="Relative" val={toRelative(tsDate)} k="rel" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Date → Timestamp */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Human Date → Timestamp</h3>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={e => { setDateInput(e.target.value); track() }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {dateValid && dateTs && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0">
              <Row label="Unix (sec)" val={String(dateTs)} k="ts-sec" />
              <Row label="Unix (ms)" val={String(dateTs * 1000)} k="ts-ms" />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
