'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('line-sort')!

type SortMode = 'az'|'za'|'length-asc'|'length-desc'|'reverse'|'shuffle'|'dedup'

export default function LineSortPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<SortMode>('az')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [trimLines, setTrimLines] = useState(true)
  const [removeBlank, setRemoveBlank] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('line-sort'); tracked.current = true }
  }

  const output = (() => {
    if (!input.trim()) return ''
    let lines = input.split('\n')
    if (trimLines) lines = lines.map(l=>l.trim())
    if (removeBlank) lines = lines.filter(l=>l)
    if (mode === 'dedup') lines = Array.from(new Set(lines))
    else if (mode === 'reverse') lines = lines.reverse()
    else if (mode === 'shuffle') { for(let i=lines.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lines[i],lines[j]]=[lines[j],lines[i]]} }
    else if (mode === 'az') lines.sort((a,b)=>(ignoreCase?a.toLowerCase():a).localeCompare(ignoreCase?b.toLowerCase():b))
    else if (mode === 'za') lines.sort((a,b)=>(ignoreCase?b.toLowerCase():b).localeCompare(ignoreCase?a.toLowerCase():a))
    else if (mode === 'length-asc') lines.sort((a,b)=>a.length-b.length)
    else if (mode === 'length-desc') lines.sort((a,b)=>b.length-a.length)
    return lines.join('\n')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('line-sort')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  const MODES: [SortMode,string][] = [['az','A\u2192Z'],['za','Z\u2192A'],['length-asc','Short first'],['length-desc','Long first'],['reverse','Reverse'],['shuffle','Shuffle'],['dedup','Deduplicate']]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map(([m,label])=>(
            <button key={m} onClick={()=>{ setMode(m); track() }}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={ignoreCase} onChange={e=>{setIgnoreCase(e.target.checked);track()}} className="accent-brand-600" />
            Ignore case
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={trimLines} onChange={e=>{setTrimLines(e.target.checked);track()}} className="accent-brand-600" />
            Trim lines
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={removeBlank} onChange={e=>{setRemoveBlank(e.target.checked);track()}} className="accent-brand-600" />
            Remove blanks
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Input ({input.split('\n').filter(l=>l.trim()).length} lines)</label>
            <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="One item per line..." rows={10}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output ({output.split('\n').filter(l=>l).length} lines)</label>
              {output && <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>}
            </div>
            <div className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm min-h-[16rem] bg-gray-50 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {output || <span className="text-gray-400">Sorted output appears here</span>}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
