'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-reverser')!

type Mode = 'chars' | 'words' | 'lines'

function reverseText(text: string, mode: Mode): string {
  if (mode === 'chars') return Array.from(text).reverse().join('')
  if (mode === 'words') return text.split(' ').reverse().join(' ')
  return text.split('\n').reverse().join('\n')
}

export default function TextReverserPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('chars')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('text-reverser'); tracked.current = true }
  }

  const output = input ? reverseText(input, mode) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-reverser')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {([['chars','tr_chars'],['words','tr_words'],['lines','tr_lines']] as [Mode,string][]).map(([m,label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t(label)}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); track() }}
          placeholder={t('tr_ph')}
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{t('ce_result')}</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 '+t('ui_copied') : t('ui_copy')}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 whitespace-pre-wrap break-all">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
