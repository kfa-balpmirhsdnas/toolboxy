'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-minifier')!
function minifyCss(css:string,opts:{comments:boolean;whitespace:boolean;zeros:boolean;colors:boolean}):string{
  let s=css
  if(opts.comments)s=s.replace(/\/\*[\s\S]*?\*\//g,'')
  if(opts.whitespace){s=s.replace(/\s+/g,' ');s=s.replace(/\s*([{}:;,>~+])\s*/g,'$1');s=s.replace(/;}/g,'}');s=s.trim()}
  if(opts.zeros){s=s.replace(/([:,\s])0\.([0-9])/g,'$1.$2');s=s.replace(/([\s:,])0(px|em|rem|%|vw|vh)/g,'$10')}
  if(opts.colors){s=s.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g,'#$1$2$3')}
  return s
}
const SAMPLE=`.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 0px auto;
}

/* Header styles */
.header {
  background-color: #336699;
  color: #ffffff;
  font-size: 24px;
  border-radius: 0.5rem;
  opacity: 0.9;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.2);
}`
export default function CssMinifierPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState(SAMPLE)
  const [rmComments,setRmComments]=useState(true)
  const [rmWhitespace,setRmWhitespace]=useState(true)
  const [optZeros,setOptZeros]=useState(true)
  const [optColors,setOptColors]=useState(true)
  const [copied,setCopied]=useState(false)
  const minified=minifyCss(input,{comments:rmComments,whitespace:rmWhitespace,zeros:optZeros,colors:optColors})
  const origB=new Blob([input]).size,minB=new Blob([minified]).size
  const savings=origB>0?Math.round((1-minB/origB)*100):0
  const copy=()=>{navigator.clipboard.writeText(minified);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {[['cm_comments',rmComments,setRmComments],['cm_whitespace',rmWhitespace,setRmWhitespace],['cm_zeros',optZeros,setOptZeros],['cm_colors',optColors,setOptColors]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{t(l as string)}
            </label>
          ))}
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('cm_input')}</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
        <div className="flex gap-3 text-sm text-center">
          {[{k:'cm_original',v:origB+' B'},{k:'cm_minified',v:minB+' B'},{k:'cm_savings',v:savings+'%',hl:true}].map(({k,v,hl})=>(
            <div key={k} className={'flex-1 rounded-xl py-2.5 '+(hl?'bg-green-50':'bg-gray-50')}>
              <p className={'font-bold '+(hl?'text-green-700':'text-gray-800')}>{v}</p>
              <p className="text-xs text-gray-500">{t(k)}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">{t('cm_minified_css')}</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
          </div>
          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-36">{minified}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}