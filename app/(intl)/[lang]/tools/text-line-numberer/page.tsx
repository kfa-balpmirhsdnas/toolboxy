'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-line-numberer')!

export default function TextLineNumbererPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('First line of text\nSecond line\nThird line with more content\nFourth line\nFifth and final line')
  const [start, setStart] = useState(1)
  const [step, setStep] = useState(1)
  const [sep, setSep] = useState('. ')
  const [padLen, setPadLen] = useState(0)
  const [includeEmpty, setIncludeEmpty] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-line-numberer'); tracked.current = true } }

  const lines = input.split('\n')
  let lineNum = start
  const output = lines.map(line => {
    if (!includeEmpty && !line.trim()) return line
    const num = String(lineNum)
    const padded = padLen > 0 ? num.padStart(padLen,'0') : num
    lineNum += step
    return padded + sep + line
  }).join('\n')

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-line-numberer')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={5} placeholder={t('tln_ph')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'tln_start', val:start, set:setStart },
            { label:'tln_step',  val:step,  set:setStep },
            { label:'tln_pad',   val:padLen, set:setPadLen },
          ].map(opt=>(
            <div key={opt.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t(opt.label)}</label>
              <input type="number" value={opt.val} min={opt.label==='tln_step'?1:0} onChange={e=>{opt.set(parseInt(e.target.value)||0);track()}}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('nsg_sep')}</label>
            <input value={sep} onChange={e=>{setSep(e.target.value);track()}} maxLength={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={includeEmpty} onChange={e=>{setIncludeEmpty(e.target.checked);track()}} className="accent-brand-600" />
          {t('tln_numempty')}
        </label>
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
