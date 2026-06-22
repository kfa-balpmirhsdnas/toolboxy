'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('word-wrap')!

function wrap(text: string, width: number, mode: 'word'|'char'|'break'): string {
  if (width <= 0) return text
  const lines = text.split('\n')
  const result: string[] = []
  for (const line of lines) {
    if (line.length <= width) { result.push(line); continue }
    if (mode === 'char') {
      for (let i=0; i<line.length; i+=width) result.push(line.slice(i,i+width))
    } else if (mode === 'break') {
      let cur = ''
      for (const word of line.split(' ')) {
        if (!cur) { cur = word; continue }
        if (cur.length + 1 + word.length <= width) cur += ' ' + word
        else { result.push(cur); cur = word }
      }
      if (cur) result.push(cur)
    } else {
      // word wrap
      let cur = ''
      for (const word of line.split(' ')) {
        if (!cur) {
          cur = word.length > width ? word.slice(0,width) : word
        } else if (cur.length + 1 + word.length <= width) {
          cur += ' ' + word
        } else {
          result.push(cur)
          cur = word.length > width ? word.slice(0,width) : word
        }
      }
      if (cur) result.push(cur)
    }
  }
  return result.join('\n')
}

export default function WordWrapPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [width, setWidth] = useState(80)
  const [mode, setMode] = useState<'word'|'char'|'break'>('word')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('word-wrap'); tracked.current = true }
  }

  const output = input ? wrap(input, width, mode) : ''
  const maxLen = output ? Math.max(...output.split('\n').map(l=>l.length)) : 0

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('word-wrap')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Wrap at (chars)</label>
            <input type="number" value={width} min={10} max={500} onChange={e=>{setWidth(parseInt(e.target.value)||80);track()}}
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
            <div className="flex gap-1">
              {([['word','Word'],['break','Break'],['char','Char']] as [typeof mode,string][]).map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);track()}}
                  className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="Paste long text to wrap..." rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Max line: {maxLen} chars | {output.split('\n').length} lines</span>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div style={{ fontFamily:'monospace' }} className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm whitespace-pre max-h-64 overflow-auto">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
