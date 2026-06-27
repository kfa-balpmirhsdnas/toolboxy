'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('list-deduplicator')!

export default function ListDeduplicatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('apple\nbanana\nApple\norange\nbanana\ngrape\nORANGE\nkiwi')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [trimLines, setTrimLines] = useState(true)
  const [removeBlank, setRemoveBlank] = useState(true)
  const [sortResult, setSortResult] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('list-deduplicator'); tracked.current = true } }

  let lines = input.split('\n')
  if (trimLines) lines = lines.map(l=>l.trim())
  if (removeBlank) lines = lines.filter(l=>l.length>0)
  
  const seen = new Set<string>()
  const unique = lines.filter(line => {
    const key = caseSensitive ? line : line.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key); return true
  })
  
  if (sortResult) unique.sort((a,b)=>(caseSensitive?a:a.toLowerCase()).localeCompare(caseSensitive?b:b.toLowerCase()))
  
  const output = unique.join('\n')
  const removedCount = lines.length - unique.length

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('list-deduplicator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={7} placeholder={t('ls_ph')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="flex flex-wrap gap-4">
          {[
            { label:'ld_case', val:caseSensitive, set:setCaseSensitive },
            { label:'ld_trim', val:trimLines, set:setTrimLines },
            { label:'ld_removeblank', val:removeBlank, set:setRemoveBlank },
            { label:'ld_sort', val:sortResult, set:setSortResult },
          ].map(opt=>(
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={opt.val} onChange={e=>{opt.set(e.target.checked);track()}} className="accent-brand-600" />
              {t(opt.label)}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{t('ld_input',{n:lines.length})}</span>
          <span className="text-brand-600 font-medium">{t('ld_unique',{n:unique.length})}</span>
          {removedCount > 0 && <span className="text-red-500">{t('ld_removed',{n:removedCount})}</span>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{t('ce_result')}</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</div>
        </div>
      </div>
    </ToolLayout>
  )
}
