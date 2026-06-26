'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-sort-by-length')!

type SortMode = 'len-asc'|'len-desc'|'alpha-asc'|'alpha-desc'|'shuffle'
type CountBy = 'chars'|'words'

export default function TextSortByLengthPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('The quick brown fox\njumps over the lazy dog\nHello world\nOne two three four five\nShort\nA bit longer line')
  const [sortMode, setSortMode] = useState<SortMode>('len-asc')
  const [countBy, setCountBy] = useState<CountBy>('chars')
  const [showLen, setShowLen] = useState(false)
  const [trim, setTrim] = useState(true)
  const [removeBlank, setRemoveBlank] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-sort-by-length'); tracked.current = true } }

  let lines = input.split('\n')
  if (trim) lines = lines.map(l=>l.trim())
  if (removeBlank) lines = lines.filter(l=>l.length>0)

  const getLen = (s: string) => countBy==='chars' ? s.length : s.split(/\s+/).filter(Boolean).length

  const sorted = [...lines].sort((a,b)=>{
    if (sortMode==='len-asc') return getLen(a)-getLen(b)
    if (sortMode==='len-desc') return getLen(b)-getLen(a)
    if (sortMode==='alpha-asc') return a.localeCompare(b)
    if (sortMode==='alpha-desc') return b.localeCompare(a)
    return Math.random()-0.5
  })

  const output = sorted.map(l=>showLen?'['+getLen(l)+'] '+l:l).join('\n')

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-sort-by-length')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  const SORT_MODES: [SortMode,string][] = [['len-asc','tsl_lenasc'],['len-desc','tsl_lendesc'],['alpha-asc','ls_az'],['alpha-desc','ls_za'],['shuffle','ls_shuffle']]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={6} placeholder={t('ls_ph')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="flex flex-wrap gap-2 items-center">
          {SORT_MODES.map(([m,label])=>(
            <button key={m} onClick={()=>{setSortMode(m);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (sortMode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t(label)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {[['chars','tsl_countchars'],['words','tsl_countwords']].map(([v,label])=>(
            <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" checked={countBy===v} onChange={()=>{setCountBy(v as CountBy);track()}} className="accent-brand-600" />
              {t(label)}
            </label>
          ))}
          {[
            { label:'tsl_showlen', val:showLen, set:setShowLen },
            { label:'tsl_trim', val:trim, set:setTrim },
            { label:'ls_removeblank', val:removeBlank, set:setRemoveBlank },
          ].map(opt=>(
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={opt.val} onChange={e=>{opt.set(e.target.checked);track()}} className="accent-brand-600" />
              {t(opt.label)}
            </label>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{t('tsl_result',{n:lines.length})}</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</div>
        </div>
      </div>
    </ToolLayout>
  )
}
