'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('json-path-tester')!

type JsonVal = string | number | boolean | null | JsonVal[] | { [k: string]: JsonVal }

function queryPath(data: JsonVal, path: string): JsonVal[] {
  if (!path || path === '$') return [data]
  const parts = path.replace(/^\$\.?/,'').split(/\.(?![^\[]*\])/)
  
  function resolve(current: JsonVal, segments: string[]): JsonVal[] {
    if (!segments.length) return [current]
    const [seg, ...rest] = segments
    
    if (seg === '*') {
      if (Array.isArray(current)) return current.flatMap(c=>resolve(c,rest))
      if (current && typeof current==='object') return Object.values(current).flatMap(c=>resolve(c,rest))
      return []
    }
    if (seg === '..') {
      // recursive descent
      const results: JsonVal[] = []
      function descend(v: JsonVal) {
        results.push(...resolve(v,rest))
        if (Array.isArray(v)) v.forEach(descend)
        else if (v&&typeof v==='object') Object.values(v).forEach(descend)
      }
      descend(current)
      return results
    }
    
    const arrMatch = seg.match(/^(\w*)\[([^\]]+)\]$/)
    if (arrMatch) {
      let obj: JsonVal = current
      if (arrMatch[1]) {
        if (!obj||typeof obj!=='object'||Array.isArray(obj)) return []
        obj = (obj as Record<string,JsonVal>)[arrMatch[1]]
      }
      const idx = arrMatch[2]
      if (idx==='*' && Array.isArray(obj)) return obj.flatMap(c=>resolve(c,rest))
      if (/^\d+$/.test(idx) && Array.isArray(obj)) {
        const v = obj[parseInt(idx)]
        return v!==undefined?resolve(v,rest):[]
      }
      if (idx.includes(':') && Array.isArray(obj)) {
        const [a,b]=idx.split(':').map(s=>s===''?undefined:parseInt(s))
        return obj.slice(a,b).flatMap(c=>resolve(c,rest))
      }
      return []
    }
    
    if (!current||typeof current!=='object'||Array.isArray(current)) return []
    const val = (current as Record<string,JsonVal>)[seg]
    return val!==undefined?resolve(val,rest):[]
  }
  
  const segs = path.replace(/^\$\.?/,'').replace(/\.\./g,'|RDESC|').split('.').flatMap(s=>s.includes('|RDESC|')?[...s.split('|RDESC|').flatMap((p,i)=>i>0?['..','',p]:[p]).filter(Boolean)]:s)
  return resolve(data, segs.filter(Boolean))
}

const SAMPLE_DATA = JSON.stringify({
  store: {
    books: [
      { title:'Sayings of the Century', author:'Nigel Rees', price:8.95 },
      { title:'Sword of Honour', author:'Evelyn Waugh', price:12.99 },
      { title:'Moby Dick', author:'Herman Melville', price:8.99 }
    ],
    bicycle: { color:'red', price:19.95 }
  }
}, null, 2)

const EXAMPLES = [
  '$.store.books[0]',
  '$.store.books[*].title',
  '$.store.books[0].author',
  '$.store.bicycle.color',
  '$.store.books[0:2]',
]

export default function JsonPathTesterPage({ params }: { params: { lang: string } }) {
  const [jsonInput, setJsonInput] = useState(SAMPLE_DATA)
  const [path, setPath] = useState('$.store.books[*].title')
  const [copied, setCopied] = useState(false)
  const [parseErr, setParseErr] = useState('')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('json-path-tester'); tracked.current = true } }

  let results: JsonVal[] = []
  let error = ''
  try {
    const parsed = JSON.parse(jsonInput)
    setParseErr('')
    try { results = queryPath(parsed, path) } catch(e:unknown) { error = e instanceof Error?e.message:'Query error' }
  } catch(e:unknown) { setParseErr(e instanceof Error?e.message:'Invalid JSON') }

  const resultStr = JSON.stringify(results.length===1?results[0]:results, null, 2)

  async function copy() {
    await navigator.clipboard.writeText(resultStr)
    trackToolCopy('json-path-tester')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">JSONPath expression</label>
          <input value={path} onChange={e=>{setPath(e.target.value);track()}} placeholder="$.store.books[*].title"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map(ex=>(
            <button key={ex} onClick={()=>{setPath(ex);track()}}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-mono transition-colors">
              {ex}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">JSON Data</label>
          <textarea value={jsonInput} onChange={e=>{setJsonInput(e.target.value);track()}} rows={7}
            className={'w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (parseErr?'border-red-300':'border-gray-200')} />
          {parseErr && <p className="text-xs text-red-600 mt-0.5">{parseErr}</p>}
        </div>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{results.length} result{results.length>1?'s':''}</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-auto max-h-48">{resultStr}</pre>
          </div>
        ) : path && !parseErr ? (
          <p className="text-sm text-gray-400">No results found for this path.</p>
        ) : null}
      </div>
    </ToolLayout>
  )
}
