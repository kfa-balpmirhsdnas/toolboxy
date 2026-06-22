'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-repeater')!

export default function TextRepeaterPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [count, setCount] = useState(5)
  const [separator, setSeparator] = useState('\n')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-repeater'); tracked.current = true } }

  const sep = separator === '\\n' ? '\n' : separator === '\\t' ? '\t' : separator
  const output = text && count > 0 ? Array(Math.min(count,10000)).fill(text).join(sep) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-repeater')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={text} onChange={e=>{setText(e.target.value);track()}} placeholder="Text to repeat..." rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat count</label>
            <input type="number" value={count} min={1} max={10000} onChange={e=>{setCount(parseInt(e.target.value)||1);track()}}
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
            <div className="flex gap-1">
              {[['\\n','New line'],[' ','Space'],['','None'],[', ',', '],['\\t','Tab']].map(([v,label])=>(
                <button key={label} onClick={()=>{setSeparator(v);track()}}
                  className={'px-2.5 py-1.5 rounded-lg text-xs transition-colors ' + (separator===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{output.length.toLocaleString()} characters</span>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {output.slice(0,1000)}{output.length>1000?'...':''}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
