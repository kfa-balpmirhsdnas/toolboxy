'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('svg-viewer')!

function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g,'')
    .replace(/\s{2,}/g,' ')
    .replace(/> </g,'><')
    .replace(/\s*([=:{};<>])\s*/g,'$1')
    .trim()
}

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1" opacity="0.8"/>
  <rect x="25" y="25" width="50" height="50" fill="none" stroke="#ec4899" stroke-width="3"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">SVG</text>
</svg>`

export default function SvgViewerPage({ params }: { params: { lang: string } }) {
  const [svg, setSvg] = useState(SAMPLE)
  const [bg, setBg] = useState<'white'|'black'|'checker'>('checker')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('svg-viewer'); tracked.current = true } }

  const isValid = svg.trim().startsWith('<svg') || svg.trim().startsWith('<?xml')
  const mini = isValid ? minifySvg(svg) : ''
  const savings = svg.length > 0 ? Math.round((1-mini.length/svg.length)*100) : 0

  async function copy() {
    await navigator.clipboard.writeText(mini)
    trackToolCopy('svg-viewer')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function download() {
    const blob = new Blob([svg],{type:'image/svg+xml'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url; a.download='image.svg'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('svg-viewer','svg')
  }
  function downloadMini() {
    const blob = new Blob([mini],{type:'image/svg+xml'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url; a.download='image.min.svg'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('svg-viewer','svg')
  }

  const bgStyle =
    bg==='white' ? 'bg-white' :
    bg==='black' ? 'bg-gray-900' :
    'bg-checker'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <style>{`
        .bg-checker {
          background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
      `}</style>
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs font-medium text-gray-600">Background:</span>
          {(['white','black','checker'] as const).map(b=>(
            <button key={b} onClick={()=>setBg(b)}
              className={'px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ' + (bg===b?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {b}
            </button>
          ))}
          <button onClick={download} className="ml-auto text-xs text-brand-600 hover:underline">Download SVG</button>
        </div>
        {isValid && (
          <div className={'flex items-center justify-center rounded-2xl border border-gray-200 min-h-48 p-4 ' + bgStyle}
            dangerouslySetInnerHTML={{ __html: svg }} />
        )}
        <textarea value={svg} onChange={e=>{setSvg(e.target.value);track()}} rows={6} placeholder="Paste SVG code..."
          className={'w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (!isValid&&svg?'border-red-300':'border-gray-200')} />
        {mini && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Minified (-{savings}%, {mini.length} bytes)</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={downloadMini} className="text-xs text-brand-600 hover:underline">Download min</button>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 break-all max-h-24 overflow-y-auto">{mini}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
