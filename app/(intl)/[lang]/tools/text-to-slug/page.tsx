'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-slug')!
const PRESETS=['Hello World Example','My Blog Post Title 2024','How to Learn JavaScript in 30 Days','Top 10 Tips for Better SEO','FAQs & Answers: Part #2']
function toSlug(text:string,sep:string,lower:boolean):string{
  let s=text.normalize('NFD').replace(/[̀-ͯ]/g,'')
  s=s.replace(/[&]/g,' and ').replace(/[@]/g,' at ')
  s=s.replace(/[^a-zA-Z0-9s-]/g,' ')
  s=s.replace(/s+/g,sep).replace(/-+/g,sep)
  s=s.replace(new RegExp('['+sep+']+','g'),sep)
  s=s.replace(new RegExp('^['+sep+']+|['+sep+']+$','g'),'')
  return lower?s.toLowerCase():s
}
export default function TextToSlugPage() {
  const t = useTranslations('toolui')
  const [text,setText]=useState('Hello World Example')
  const [sep,setSep]=useState('-')
  const [lower,setLower]=useState(true)
  const [copied,setCopied]=useState(false)
  const slug=toSlug(text,sep,lower)
  const copy=()=>{navigator.clipboard.writeText(slug);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('tts_input')}</label>
          <input value={text} onChange={e=>setText(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5" placeholder={t('tts_ph')}/></div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('tts_sep')}</span>
            {['-','_','.'].map(s=>(
              <button key={s} onClick={()=>setSep(s)}
                className={'px-3 py-1.5 rounded border text-sm font-mono font-semibold transition '+(sep===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
            <input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)} className="rounded"/>
            <span className="text-sm text-gray-600">{t('tts_lower')}</span>
          </label>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
          <code className="flex-1 text-green-400 font-mono text-sm break-all">{slug||'—'}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('tts_examples')}</p>
          <div className="space-y-1.5">
            {PRESETS.map(p=>(
              <div key={p} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={()=>setText(p)}>
                <span className="text-sm text-gray-600 truncate">{p}</span>
                <span className="text-xs font-mono text-gray-400 truncate">{toSlug(p,sep,lower)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}