'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('password-generator')!

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function strengthLabel(pw: string, t: (k: string) => string) {
  if (pw.length === 0) return null
  let score = 0
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { label: t('pg_weak'), color: 'text-red-500', width: 'w-1/4', bg: 'bg-red-400' }
  if (score <= 4) return { label: t('pg_fair'), color: 'text-yellow-600', width: 'w-2/4', bg: 'bg-yellow-400' }
  if (score <= 5) return { label: t('pg_strong'), color: 'text-green-600', width: 'w-3/4', bg: 'bg-green-400' }
  return { label: t('pg_vstrong'), color: 'text-green-700', width: 'w-full', bg: 'bg-green-500' }
}

export default function PasswordGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  const generate = useCallback(() => {
    let charset = ''
    if (options.uppercase) charset += CHARSETS.uppercase
    if (options.lowercase) charset += CHARSETS.lowercase
    if (options.numbers) charset += CHARSETS.numbers
    if (options.symbols) charset += CHARSETS.symbols
    if (!charset) return
    const arr = new Uint32Array(length)
    const generated = []
    for (let i = 0; i < count; i++) {
      crypto.getRandomValues(arr)
      generated.push(Array.from(arr).map((n) => charset[n % charset.length]).join(''))
    }
    setPassword(generated[0]); setPasswords(generated); setCopied(false)
  }, [length, options, count])

  async function copy(pw: string) {
    await navigator.clipboard.writeText(pw)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const strength = strengthLabel(password, t)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {password && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm font-mono text-gray-900 break-all">{password}</code>
            <button onClick={() => copy(password)} className="shrink-0 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors font-medium">
              {copied ? <ToolIcon name="check" className="w-3.5 h-3.5 inline" /> : t('ui_copy')}
            </button>
          </div>
        )}
        {strength && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">{t('pg_strength')}</span>
              <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${strength.width} ${strength.bg}`} />
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between text-sm text-gray-700 mb-2"><span>{t('pg_length')}</span><span className="font-semibold">{length}</span></div>
          <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={options[key]} onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
              <span className="text-sm text-gray-700 capitalize">{t('pg_'+key)}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 shrink-0">{t('ui_generate')}</label>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400">
            {[1, 5, 10, 20].map((n) => <option key={n} value={n}>{t('pg_npw',{n})}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={!Object.values(options).some(Boolean)} className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">
          {t('pg_generate')}
        </button>
        {passwords.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('pg_allgen')}</p>
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <code className="flex-1 text-xs font-mono text-gray-700 break-all">{pw}</code>
                <button onClick={() => copy(pw)} className="text-xs text-gray-400 hover:text-brand-600 shrink-0">{t('ui_copy')}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}