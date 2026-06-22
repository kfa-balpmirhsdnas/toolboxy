'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('json-diff')!

function deepDiff(a: unknown, b: unknown, path = ''): string[] {
  const results: string[] = []
  if (typeof a !== typeof b || (Array.isArray(a) !== Array.isArray(b))) {
    results.push('Changed: ' + (path||'root') + '\n  - ' + JSON.stringify(a) + '\n  + ' + JSON.stringify(b))
    return results
  }
  if (a === null || b === null) {
    if (a !== b) results.push('Changed: ' + (path||'root') + '\n  - ' + JSON.stringify(a) + '\n  + ' + JSON.stringify(b))
    return results
  }
  if (typeof a !== 'object') {
    if (a !== b) results.push('Changed: ' + (path||'root') + '\n  - ' + JSON.stringify(a) + '\n  + ' + JSON.stringify(b))
    return results
  }
  const ao = a as Record<string,unknown>, bo = b as Record<string,unknown>
  const allKeys = Array.from(new Set([...Object.keys(ao), ...Object.keys(bo)]))
  for (const k of allKeys) {
    const p = path ? path+'.'+k : k
    if (!(k in ao)) results.push('Added: ' + p + ' = ' + JSON.stringify(bo[k]))
    else if (!(k in bo)) results.push('Removed: ' + p + ' = ' + JSON.stringify(ao[k]))
    else results.push(...deepDiff(ao[k], bo[k], p))
  }
  return results
}

export default function JsonDiffPage({ params }: { params: { lang: string } }) {
  const [jsonA, setJsonA] = useState('')
  const [jsonB, setJsonB] = useState('')
  const [result, setResult] = useState<string[]|null>(null)
  const [errors, setErrors] = useState<{a?:string,b?:string}>({})
  const tracked = useRef(false)

  function compare() {
    if (!tracked.current) { trackToolUsed('json-diff'); tracked.current = true }
    const errs: {a?:string,b?:string} = {}
    let pa: unknown, pb: unknown
    try { pa = JSON.parse(jsonA) } catch(e: unknown) { errs.a = e instanceof Error ? e.message : 'Invalid JSON' }
    try { pb = JSON.parse(jsonB) } catch(e: unknown) { errs.b = e instanceof Error ? e.message : 'Invalid JSON' }
    setErrors(errs)
    if (!errs.a && !errs.b) setResult(deepDiff(pa, pb))
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[['A (Original)',jsonA,setJsonA,'a'],['B (Modified)',jsonB,setJsonB,'b']].map(([label,val,setter,key]) => (
            <div key={String(key)}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{String(label)}</label>
              <textarea value={String(val)} onChange={e=>(setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                placeholder={'{"key": "value"}'}
                rows={8}
                className={'w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (errors[key as 'a'|'b'] ? 'border-red-300':'border-gray-200')} />
              {errors[key as 'a'|'b'] && <p className="text-xs text-red-600 mt-0.5">{errors[key as 'a'|'b']}</p>}
            </div>
          ))}
        </div>
        <button onClick={compare} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">Compare</button>
        {result !== null && (
          <div>
            {result.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">\u2713 No differences found — JSONs are identical.</div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">{result.length} difference{result.length>1?'s':''} found:</p>
                {result.map((r,i) => (
                  <div key={i} className={'p-3 rounded-xl border text-xs font-mono whitespace-pre-wrap ' + (r.startsWith('Added')?'bg-green-50 border-green-200 text-green-800':r.startsWith('Removed')?'bg-red-50 border-red-200 text-red-800':'bg-yellow-50 border-yellow-200 text-yellow-800')}>
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
