'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('text-diff-inline')!

type DiffToken = { text: string; type: 'equal' | 'add' | 'remove' }

function diffWords(a: string, b: string): DiffToken[] {
  const wa = a.split(/(\s+)/)
  const wb = b.split(/(\s+)/)
  const m = wa.length, n = wb.length
  const dp: number[][] = Array(m+1).fill(null).map(()=>Array(n+1).fill(0))
  for (let i=m-1;i>=0;i--) for (let j=n-1;j>=0;j--) {
    if (wa[i]===wb[j]) dp[i][j]=dp[i+1][j+1]+1
    else dp[i][j]=Math.max(dp[i+1][j],dp[i][j+1])
  }
  const result: DiffToken[] = []
  let i=0,j=0
  while (i<m&&j<n) {
    if (wa[i]===wb[j]) { result.push({text:wa[i],type:'equal'}); i++; j++ }
    else if (dp[i+1][j]>=dp[i][j+1]) { result.push({text:wa[i],type:'remove'}); i++ }
    else { result.push({text:wb[j],type:'add'}); j++ }
  }
  while (i<m) { result.push({text:wa[i++],type:'remove'}) }
  while (j<n) { result.push({text:wb[j++],type:'add'}) }
  return result
}

export default function TextDiffInlinePage({ params }: { params: { lang: string } }) {
  const [original, setOriginal] = useState('The quick brown fox jumps over the lazy dog.')
  const [modified, setModified] = useState('The fast brown fox leaps over the sleepy cat.')
  const [mode, setMode] = useState<'word'|'char'>('word')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-diff-inline'); tracked.current = true } }

  const tokens = mode==='word'
    ? diffWords(original, modified)
    : diffWords(Array.from(original).join('\x00'), Array.from(modified).join('\x00'))
        .map(t=>({...t, text:t.text.replace(/\x00/g,'')}))

  const adds = tokens.filter(t=>t.type==='add').length
  const removes = tokens.filter(t=>t.type==='remove').length

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          {(['word','char'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m} diff
            </button>
          ))}
          {(adds>0||removes>0) && (
            <span className="ml-auto text-xs">
              <span className="text-green-600">+{adds}</span> <span className="text-red-500">-{removes}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Original</label>
            <textarea value={original} onChange={e=>{setOriginal(e.target.value);track()}} rows={4}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Modified</label>
            <textarea value={modified} onChange={e=>{setModified(e.target.value);track()}} rows={4}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Inline diff</label>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed min-h-12 whitespace-pre-wrap">
            {tokens.map((t,i)=>(
              t.type==='equal' ? <span key={i}>{t.text}</span> :
              t.type==='add' ? <span key={i} className="bg-green-100 text-green-800 rounded px-0.5">{t.text}</span> :
              <span key={i} className="bg-red-100 text-red-700 line-through rounded px-0.5">{t.text}</span>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
