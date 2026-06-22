'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('lorem-ipsum-generator')!
const W='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ')
const cap=(s: string)=>s.charAt(0).toUpperCase()+s.slice(1)
const rw=(min: number,max: number)=>{const n=min+Math.floor(Math.random()*(max-min+1));return Array.from({length:n},()=>W[Math.floor(Math.random()*W.length)])}
const sentence=()=>{const w=rw(6,15);w[0]=cap(w[0]);return w.join(' ')+'.'}
const paragraph=()=>Array.from({length:3+Math.floor(Math.random()*4)},sentence).join(' ')
function gen(type: 'words'|'sentences'|'paragraphs',count: number,start: boolean): string {
  if(type==='words'){const w=rw(count,count);if(start){w[0]='Lorem';if(w.length>1)w[1]='ipsum'}return cap(w[0])+' '+w.slice(1).join(' ')}
  if(type==='sentences'){const s=Array.from({length:count},sentence);if(start)s[0]='Lorem ipsum dolor sit amet, consectetur adipiscing elit.';return s.join(' ')}
  const p=Array.from({length:count},paragraph);if(start)p[0]='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';return p.join('\n\n')
}
export default function LoremIpsumPage({ params }: { params: { lang: string } }) {
  const [type, setType] = useState<'words'|'sentences'|'paragraphs'>('paragraphs')
  const [count, setCount] = useState(3)
  const [start, setStart] = useState(true)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const generate = useCallback(() => setResult(gen(type,count,start)), [type,count,start])
  async function copy() { if(!result)return; await navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600 shrink-0">Generate</label><input type="number" value={count} min={1} max={100} onChange={e=>setCount(Math.max(1,Math.min(100,Number(e.target.value))))} className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 text-center" /></div>
          {(['words','sentences','paragraphs'] as const).map(t=>(<button key={t} onClick={()=>setType(t)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${type===t?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>))}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"><input type="checkbox" checked={start} onChange={e=>setStart(e.target.checked)} className="accent-brand-600" />Start with "Lorem ipsum"</label>
        </div>
        <button onClick={generate} className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">Generate</button>
        {result&&(<div className="relative"><textarea readOnly value={result} rows={type==='paragraphs'?10:5} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none" /><button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">{copied?'✓ Copied':'Copy'}</button></div>)}
      </div>
    </ToolLayout>
  )
}