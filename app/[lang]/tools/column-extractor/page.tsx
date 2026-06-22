'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('column-extractor')!

export default function ColumnExtractorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('Alice,30,Engineer\nBob,25,Designer\nCarol,35,Manager')
  const [delimiter, setDelimiter] = useState(',')
  const [columns, setColumns] = useState('1')
  const [outSep, setOutSep] = useState(',')
  const [hasHeader, setHasHeader] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('column-extractor'); tracked.current = true } }

  const colNums = columns.split(',').map(c=>c.trim()).filter(c=>c).map(c=>parseInt(c)-1).filter(n=>!isNaN(n)&&n>=0)
  const delim = delimiter === '\\t' ? '\t' : delimiter
  const outDelim = outSep === '\\n' ? '\n' : outSep === '\\t' ? '\t' : outSep

  const lines = input.split('\n')
  const dataLines = hasHeader ? lines.slice(1) : lines
  const header = hasHeader ? lines[0] : null
  const allCols = lines[0] ? lines[0].split(delim) : []

  const output = dataLines.filter(l=>l.trim()).map(line => {
    const cells = line.split(delim)
    return colNums.map(i => cells[i] ?? '').join(outDelim)
  }).join('\n')

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('column-extractor')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="Paste delimited text..." rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Input delimiter</label>
            <input value={delimiter} onChange={e=>{setDelimiter(e.target.value);track()}} placeholder=","
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Columns (1-based)</label>
            <input value={columns} onChange={e=>{setColumns(e.target.value);track()}} placeholder="1,3"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Output separator</label>
            <input value={outSep} onChange={e=>{setOutSep(e.target.value);track()}} placeholder=","
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={hasHeader} onChange={e=>{setHasHeader(e.target.checked);track()}} className="accent-brand-600" />
              Has header row
            </label>
          </div>
        </div>
        {allCols.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allCols.map((c,i)=>(
              <button key={i} onClick={()=>{setColumns(prev=>{const existing=prev.split(',').map(s=>s.trim()).filter(s=>s);const idx=String(i+1);return existing.includes(idx)?existing.filter(s=>s!==idx).join(','):existing.concat(idx).join(',')});track()}}
                className={'px-2 py-1 rounded-lg text-xs transition-colors ' + (colNums.includes(i)?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {c||'Col '+(i+1)}
              </button>
            ))}
          </div>
        )}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Result ({dataLines.filter(l=>l.trim()).length} rows)</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
