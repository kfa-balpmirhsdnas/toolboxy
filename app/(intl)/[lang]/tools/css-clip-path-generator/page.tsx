'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-clip-path-generator')!
const PRESETS=[
  {name:'ccp_p_triangle',path:'polygon(50% 0%, 0% 100%, 100% 100%)'},
  {name:'ccp_p_diamond',path:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'},
  {name:'ccp_p_pentagon',path:'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'},
  {name:'ccp_p_hexagon',path:'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'},
  {name:'ccp_p_arrow',path:'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'},
  {name:'ccp_p_star',path:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'},
  {name:'ccp_p_parallelogram',path:'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'},
  {name:'ccp_p_cross',path:'polygon(33% 0%, 66% 0%, 66% 33%, 100% 33%, 100% 66%, 66% 66%, 66% 100%, 33% 100%, 33% 66%, 0% 66%, 0% 33%, 33% 33%)'},
  {name:'ccp_p_circle',path:'circle(50% at 50% 50%)'},
  {name:'ccp_p_ellipse',path:'ellipse(50% 30% at 50% 50%)'},
  {name:'ccp_p_inset',path:'inset(10% 15% 10% 15% round 10px)'},
]
export default function CssClipPathGeneratorPage() {
  const t = useTranslations('toolui')
  const [clipPath,setClipPath]=useState('polygon(50% 0%, 0% 100%, 100% 100%)')
  const [bg,setBg]=useState('#6366f1')
  const [copied,setCopied]=useState(false)
  const css='clip-path: '+clipPath+';'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>setClipPath(p.path)}
              className={'px-3 py-1.5 rounded-full border text-xs font-medium transition '+(clipPath===p.path?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>{t(p.name)}</button>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('ccp_custom')}</label>
          <input value={clipPath} onChange={e=>setClipPath(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" spellCheck={false}/>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">{t('ip_bg')}</span>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
        </div>
        <div className="flex justify-center py-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-48 h-48" style={{background:bg,clipPath}}/>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <code className="text-green-400 font-mono text-sm break-all">{css}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
        </div>
        <div className="text-xs text-gray-400 space-y-0.5">
          <p><strong className="text-gray-600">polygon()</strong> — {t('ccp_d_polygon')}</p>
          <p><strong className="text-gray-600">circle(r at x y)</strong> — {t('ccp_d_circle')}</p>
          <p><strong className="text-gray-600">ellipse(rx ry at x y)</strong> — {t('ccp_d_ellipse')}</p>
          <p><strong className="text-gray-600">inset(top right bottom left round radius)</strong> — {t('ccp_d_inset')}</p>
        </div>
      </div>
    </ToolLayout>
  )
}