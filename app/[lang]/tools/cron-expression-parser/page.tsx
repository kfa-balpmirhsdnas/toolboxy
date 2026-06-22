'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('cron-expression-parser')!

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseField(field: string, min: number, max: number): number[] {
  const result = new Set<number>()
  for (const part of field.split(',')) {
    if (part === '*') { for (let i = min; i <= max; i++) result.add(i); continue }
    if (part.includes('/')) {
      const [range, step] = part.split('/')
      const s = parseInt(step)
      const start = range === '*' ? min : parseInt(range.split('-')[0])
      const end = range.includes('-') ? parseInt(range.split('-')[1]) : max
      for (let i = start; i <= end; i += s) result.add(i)
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number)
      for (let i = s; i <= e; i++) result.add(i)
    } else {
      result.add(parseInt(part))
    }
  }
  return Array.from(result).sort((a, b) => a - b)
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid: must have 5 fields (min hour dom month dow)'
  const [min, hour, dom, month, dow] = parts
  const lines: string[] = []
  if (min === '*') lines.push('every minute')
  else if (min.startsWith('*/')) lines.push('every ' + min.slice(2) + ' minutes')
  else lines.push('at minute ' + min)
  if (hour === '*') {} // covered
  else if (hour.startsWith('*/')) lines.push('every ' + hour.slice(2) + ' hours')
  else lines.push('at hour ' + hour)
  if (dom !== '*') lines.push('on day ' + dom + ' of month')
  if (month !== '*') {
    const ms = parseField(month, 1, 12).map(m => MONTHS[m - 1]).join(', ')
    lines.push('in ' + ms)
  }
  if (dow !== '*') {
    const ds = parseField(dow, 0, 6).map(d => DAYS[d]).join(', ')
    lines.push('on ' + ds)
  }
  return lines.join(', ')
}

function nextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []
  const [minF, hourF, domF, monthF, dowF] = parts
  const mins = parseField(minF, 0, 59)
  const hours = parseField(hourF, 0, 23)
  const doms = parseField(domF, 1, 31)
  const months = parseField(monthF, 1, 12)
  const dows = parseField(dowF, 0, 6)

  const results: Date[] = []
  const now = new Date()
  now.setSeconds(0, 0)
  now.setMinutes(now.getMinutes() + 1)
  const limit = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000)

  for (let d = new Date(now); d < limit && results.length < count; d.setMinutes(d.getMinutes() + 1)) {
    const m = d.getMonth() + 1, dom = d.getDate(), dow = d.getDay()
    const h = d.getHours(), mn = d.getMinutes()
    if (!months.includes(m)) continue
    if (domF !== '*' && !doms.includes(dom)) continue
    if (dowF !== '*' && !dows.includes(dow)) continue
    if (!hours.includes(h)) continue
    if (!mins.includes(mn)) continue
    results.push(new Date(d))
  }
  return results
}

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Every Monday 9am', value: '0 9 * * 1' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: '1st of month', value: '0 0 1 * *' },
]

export default function CronParserPage({ params }: { params: { lang: string } }) {
  const [expr, setExpr] = useState('0 9 * * 1-5')
  const [tracked, setTracked] = useState(false)

  function track() { if (!tracked) { trackToolUsed('cron-expression-parser'); setTracked(true) } }

  let description = ''
  let runs: Date[] = []
  let parseError = ''
  try {
    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 5) throw new Error('Must have exactly 5 fields')
    description = describeCron(expr)
    runs = nextRuns(expr)
  } catch (e: unknown) {
    parseError = (e as Error).message
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
          <input
            type="text"
            value={expr}
            onChange={e => { setExpr(e.target.value); track() }}
            placeholder="* * * * *"
            className="w-full p-4 border border-gray-200 rounded-xl text-lg font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-gray-400 mt-1 font-mono">minute Â· hour Â· day-of-month Â· month Â· day-of-week</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => { setExpr(p.value); track() }}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {parseError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-mono">â {parseError}</div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">Description</p>
              <p className="text-sm text-blue-800 font-medium capitalize">{description}</p>
            </div>
            {runs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Next {runs.length} Runs</p>
                </div>
                <ul className="divide-y divide-gray-100">
                  {runs.map((d, i) => (
                    <li key={i} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm font-mono text-gray-700">{d.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-gray-400">Standard 5-field cron format Â· Local timezone</p>
      </div>
    </ToolLayout>
  )
}
