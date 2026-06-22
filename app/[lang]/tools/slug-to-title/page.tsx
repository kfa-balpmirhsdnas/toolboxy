'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('slug-to-title')!

const SMALL = new Set(['a','an','the','and','but','or','nor','for','yet','so','at','by','for','from','in','into','of','off','on','onto','out','over','to','up','via','with'])

function toTitle(slug: string, style: string): string {
  const words = slug.replace(/[-_]+/g,' ').replace(/[^a-zA-Z0-9 ]/g,'').split(' ').filter(Boolean)
  if (!words.length) return ''
  if (style === 'title') {
    return words.map((w,i)=>{
      if (i>0 && SMALL.has(w.toLowerCase())) return w.toLowerCase()
      return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()
    }).join(' ')
  }
  if (style === 'upper') return words.map(w=>w.toUpperCase()).join(' ')
  if (style === 'lower') return words.join(' ').toLowerCase()
  if (style === 'sentence') return words.map((w,i)=>i===0?w.charAt(0).toUpperCase()+w.slice(1).toLowerCase():w.toLowerCase()).join(' ')
  if (style === 'camel') return words.map((w,i)=>i===0?w.toLowerCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join('')
  if (style === 'pascal') return words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join('')
  return words.join(' ')
}

const STYLES = [
  { id:'title', label:'Title Case' },
  { id:'sentence', label:'Sentence case' },
  { id:'upper', label:'UPPER CASE' },
  { id:'lower', label:'lower case' },
  { id:'camel', label:'camelCase' },
  { id:'pascal', label:'PascalCase' },
]

export default function SlugToTitlePage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('the-quick-brown-fox-jumps-over-the-lazy-dog')
  const [style, setStyle] = useState('title')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('slug-to-title'); tracked.current = true } }

  const output = toTitle(input, style)

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('slug-to-title')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug or kebab-case text</label>
          <input value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="my-awesome-blog-post"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s=>(
            <button key={s.id} onClick={()=>{setStyle(s.id);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (style===s.id?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {s.label}
            </button>
          ))}
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Result</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-semibold text-gray-800 break-all">{output}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
