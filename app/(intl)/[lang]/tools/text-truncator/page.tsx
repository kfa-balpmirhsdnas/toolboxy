'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-truncator')!

type Unit = 'chars'|'words'|'sentences'
type Position = 'end'|'start'|'middle'

function truncate(text: string, limit: number, unit: Unit, pos: Position, ellipsis: string): string {
  if (!text || limit <= 0) return ''
  
  let parts: string[]
  if (unit === 'chars') {
    if (text.length <= limit) return text
    if (pos === 'end') return text.slice(0,limit).trimEnd() + ellipsis
    if (pos === 'start') return ellipsis + text.slice(-limit).trimStart()
    const half = Math.floor(limit/2)
    return text.slice(0,half).trimEnd() + ellipsis + text.slice(-half).trimStart()
  }
  if (unit === 'words') {
    parts = text.split(/\s+/).filter(Boolean)
    if (parts.length <= limit) return text
    if (pos === 'end') return parts.slice(0,limit).join(' ') + ellipsis
    if (pos === 'start') return ellipsis + parts.slice(-limit).join(' ')
    const half = Math.floor(limit/2)
    return parts.slice(0,half).join(' ') + ellipsis + parts.slice(-half).join(' ')
  }
  // sentences
  parts = text.split(/(?<=[.!?])\s+/)
  if (parts.length <= limit) return text
  if (pos === 'end') return parts.slice(0,limit).join(' ') + ellipsis
  if (pos === 'start') return ellipsis + parts.slice(-limit).join(' ')
  const half = Math.floor(limit/2)
  return parts.slice(0,half).join(' ') + ellipsis + parts.slice(-half).join(' ')
}

const SAMPLE = 'The quick brown fox jumps over the lazy dog. It was a beautiful morning. The sun shone brightly in the clear blue sky. Birds were singing in the trees. Everyone felt wonderful and full of hope.'

export default function TextTruncatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState(SAMPLE)
  const [limit, setLimit] = useState(50)
  const [unit, setUnit] = useState<Unit>('chars')
  const [position, setPosition] = useState<Position>('end')
  const [ellipsis, setEllipsis] = useState('...')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-truncator'); tracked.current = true } }

  const output = truncate(input, limit, unit, position, ellipsis)

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-truncator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={4} placeholder={t('ttr_ph')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ttr_limit')}</label>
            <input type="number" value={limit} min={1} onChange={e=>{setLimit(parseInt(e.target.value)||1);track()}}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('sp_unit')}</label>
            <select value={unit} onChange={e=>{setUnit(e.target.value as Unit);track()}}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              <option value="chars">{t('ttr_chars')}</option>
              <option value="words">{t('lip_words')}</option>
              <option value="sentences">{t('lip_sentences')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ttr_position')}</label>
            <select value={position} onChange={e=>{setPosition(e.target.value as Position);track()}}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              <option value="end">{t('ttr_end')}</option>
              <option value="start">{t('ttr_start')}</option>
              <option value="middle">{t('ttr_middle')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ttr_ellipsis')}</label>
            <input value={ellipsis} onChange={e=>{setEllipsis(e.target.value);track()}} maxLength={10}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{t('ttr_result',{n:output.length})}</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm break-all">{output}</div>
        </div>
      </div>
    </ToolLayout>
  )
}
