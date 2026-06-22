'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('passphrase-strength')!

function analyze(pp: string) {
  const words = pp.trim().split(' ').filter(w => w.length > 0)
  const len = pp.length
  const hasDigit = /[0-9]/.test(pp)
  const hasSpecial = /[^a-zA-Z0-9 ]/.test(pp)
  let score = 0
  if (words.length >= 4) score++
  if (words.length >= 6) score++
  if (len >= 20) score++
  if (len >= 30) score++
  if (hasDigit || hasSpecial) score++
  const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong']
  return { score, label: labels[Math.min(score, 5)], words: words.length, len, hasDigit, hasSpecial }
}

export default function PassphraseStrengthPage() {
  const [pp, setPp] = useState('')
  const r = pp ? analyze(pp) : null
  const pct = r ? Math.round((r.score / 5) * 100) : 0
  const barColor = pct < 40 ? 'bg-red-500' : pct < 60 ? 'bg-yellow-500' : pct < 80 ? 'bg-blue-500' : 'bg-green-500'

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Passphrase</label>
          <textarea
            value={pp}
            onChange={e => setPp(e.target.value)}
            placeholder="Enter your passphrase to check its strength..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {r && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Strength: {r.label}</span>
                <span className="text-gray-500">{r.words} words / {r.len} chars</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${barColor}`} style={{width: pct + '%'}} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`rounded p-2 ${r.hasDigit ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>Numbers: {r.hasDigit ? 'Yes' : 'No'}</div>
              <div className={`rounded p-2 ${r.hasSpecial ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>Symbols: {r.hasSpecial ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}