'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-padder')!

export default function TextPadderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [padChar, setPadChar] = useState(' ')
  const [width, setWidth] = useState(20)
  const [align, setAlign] = useState<'left'|'right'|'center'>('left')
  const [applyToAll, setApplyToAll] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('text-padder'); tracked.current = true }
  }

  function padLine(line: string): string {
    const len = line.length
    if (len >= width) return line
    const total = width - len
    if (align === 'left') return line + padChar.charAt(0).repeat(total)
    if (align === 'right') return padChar.charAt(0).repeat(total) + line
    const left = Math.floor(total/2), right = total-left
    return padChar.charAt(0).repeat(left) + line + padChar.charAt(0).repeat(right)
  }

  const output = (() => {
    if (!input) return ''
    const lines = input.split('\n')
    if (applyToAll) {
      const maxLen = Math.max(...lines.map(l=>l.length))
      const targetWidth = Math.max(width, maxLen)
      return lines.map(l => {
        const len = l.length
        if (len >= targetWidth) return l
        const total = targetWidth - len
        if (align === 'left') return l + padChar.charAt(0).repeat(total)
        if (align === 'right') return padChar.charAt(0).repeat(total) + l
        const left = Math.floor(total/2)
        return padChar.charAt(0).repeat(left) + l + padChar.charAt(0).repeat(total-left)
      }).join('\n')
    }
    return lines.map(padLine).join('\n')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-padder')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('tpd_padchar')}</label>
            <input value={padChar} onChange={e=>{setPadChar(e.target.value.slice(-1)||' ');track()}} maxLength={1}
              className="w-16 px-3 py-2 border border-gray-200 rounded-xl text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ui_width')}</label>
            <input type="number" value={width} min={1} max={500} onChange={e=>{setWidth(parseInt(e.target.value)||1);track()}}
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('tpd_align')}</label>
            <div className="flex gap-1">
              {([['left','tpd_left'],['center','tpd_center'],['right','tpd_right']] as [typeof align,string][]).map(([a,label])=>(
                <button key={a} onClick={()=>{setAlign(a);track()}}
                  className={'px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ' + (align===a?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm mb-0.5">
            <input type="checkbox" checked={applyToAll} onChange={e=>{setApplyToAll(e.target.checked);track()}} className="accent-brand-600" />
            {t('tpd_autofit')}
          </label>
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder={t('tpd_ph')} rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{t('ce_result')}</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono whitespace-pre overflow-x-auto">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
