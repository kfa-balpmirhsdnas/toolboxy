'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('number-sequence-generator')!

export default function NumberSequenceGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)
  const [step, setStep] = useState(1)
  const [separator, setSeparator] = useState(',')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [pad, setPad] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('number-sequence-generator'); tracked.current = true }
  }

  const count = step === 0 ? 0 : Math.max(0, Math.floor((end - start) / step) + 1)
  const padLen = pad ? String(end).length : 0

  const output = (() => {
    if (count === 0 || count > 10000) return count > 10000 ? t('nsg_toomany') : ''
    const nums: string[] = []
    for (let i = start; i <= end; i += step) {
      const s = pad ? String(i).padStart(padLen,'0') : String(i)
      nums.push(prefix + s + suffix)
    }
    const sep = separator === '\\n' ? '\n' : separator === '\\t' ? '\t' : separator
    return nums.join(sep)
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('number-sequence-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function download() {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='sequence.txt'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('number-sequence-generator','txt')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[['nsg_start',start,setStart],['nsg_end',end,setEnd],['nsg_step',step,setStep]].map(([label,val,setter])=>(
            <div key={String(label)}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t(String(label))}</label>
              <input type="number" value={String(val)} onChange={e=>{(setter as React.Dispatch<React.SetStateAction<number>>)(Number(e.target.value)||0);track()}}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('nsg_sep')}</label>
            <div className="flex gap-1 flex-wrap">
              {[[',',','],['\\n',t('nsg_newline')],['\\t',t('ce_tab')],[' ',t('ce_space')],[';',';']].map(([v,label])=>(
                <button key={v} onClick={()=>{ setSeparator(v); track() }}
                  className={'px-2 py-1 rounded-lg text-xs transition-colors ' + (separator===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('nsg_prefix')}</label>
              <input value={prefix} onChange={e=>{setPrefix(e.target.value);track()}} placeholder="e.g. item_"
                className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('nsg_suffix')}</label>
              <input value={suffix} onChange={e=>{setSuffix(e.target.value);track()}} placeholder="e.g. px"
                className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={pad} onChange={e=>{setPad(e.target.checked);track()}} className="accent-brand-600" />
          {t('nsg_zeropad')}
        </label>
        {count > 0 && count <= 10000 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{t('nsg_generated',{n:count})}</span>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">{t('ui_download')}</button>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono break-all max-h-40 overflow-y-auto whitespace-pre-wrap">
              {output.slice(0,500)}{output.length>500?'...':''}
            </div>
          </div>
        )}
        {count > 10000 && <p className="text-xs text-red-600">{t('nsg_toomany2')}</p>}
      </div>
    </ToolLayout>
  )
}
