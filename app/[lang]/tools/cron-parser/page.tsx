'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

interface CronField { name: string; value: string; desc: string }

function parseCron(expr: string): { fields: CronField[]; next: string[]; error?: string } {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6) {
    return { fields: [], next: [], error: 'Cron expression must have 5 or 6 fields' }
  }
  const hasSec = parts.length === 6
  const [sec, min, hour, dom, month, dow] = hasSec
    ? parts
    : ['0', ...parts]

  function descField(val: string, unit: string, names?: string[]): string {
    if (val === '*') return `Every ${unit}`
    if (val.startsWith('*/')) return `Every ${val.slice(2)} ${unit}s`
    if (val.includes(',')) return val.split(',').map(v => names?.[+v] ?? v).join(', ')
    if (val.includes('-')) {
      const [a, b] = val.split('-')
      return `${names?.[+a] ?? a} to ${names?.[+b] ?? b}`
    }
    return names?.[+val] ?? val
  }

  const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const fields: CronField[] = [
    ...(hasSec ? [{ name: 'Second', value: sec, desc: descField(sec, 'second') }] : []),
    { name: 'Minute', value: min, desc: descField(min, 'minute') },
    { name: 'Hour', value: hour, desc: descField(hour, 'hour') },
    { name: 'Day of Month', value: dom, desc: descField(dom, 'day') },
    { name: 'Month', value: month, desc: descField(month, 'month', MONTHS) },
    { name: 'Day of Week', value: dow, desc: descField(dow, 'weekday', DAYS) },
  ]

  // Generate next 5 run times (simplified)
  const next: string[] = []
  try {
    const now = new Date()
    let d = new Date(now)
    d.setSeconds(0, 0)
    d.setMinutes(d.getMinutes() + 1)
    const minV = min === '*' ? -1 : +min
    const hourV = hour === '*' ? -1 : +hour
    for (let i = 0; i < 200 && next.length < 5; i++) {
      const okMin = minV === -1 || d.getMinutes() === minV
      const okHour = hourV === -1 || d.getHours() === hourV
      if (okMin && okHour) next.push(d.toLocaleString())
      d.setMinutes(d.getMinutes() + 1)
    }
  } catch {}

  return { fields, next }
}

const EXAMPLES = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Every Monday 9am', expr: '0 9 * * 1' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'First day of month', expr: '0 0 1 * *' },
]


const tool = getToolBySlug('cron-parser')!

export default function CronParserPage() {
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const result = parseCron(expr)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cron Expression Parser</h1>
        <p className="text-gray-500 mb-8">Parse and understand cron expressions with human-readable descriptions.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              placeholder="* * * * *"
            />
            <p className="text-xs text-gray-400 mt-1">Format: minute hour day-of-month month day-of-week</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex.expr} onClick={() => setExpr(ex.expr)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200">
                {ex.label}
              </button>
            ))}
          </div>

          {result.error ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{result.error}</div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {result.fields.map(f => (
                  <div key={f.name} className="flex items-center p-3 bg-white">
                    <div className="w-32 text-xs font-medium text-gray-500">{f.name}</div>
                    <div className="w-16 font-mono text-sm text-gray-800">{f.value}</div>
                    <div className="text-sm text-gray-600">{f.desc}</div>
                  </div>
                ))}
              </div>
              {result.next.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">Next runs</h2>
                  <ul className="space-y-1">
                    {result.next.map((t, i) => (
                      <li key={i} className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded">{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
