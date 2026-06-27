'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const t = useTranslations('toolui')
  const [title,setTitle]=useState('My Page')
  const [desc,setDesc]=useState('A description for search engines.')
  const [url,setUrl]=useState('https://example.com')
  const [img,setImg]=useState('https://example.com/og.png')
  const [kw,setKw]=useState('keyword1, keyword2')
  const [author,setAuthor]=useState('')
  const nl='\n'
  const tags='<!-- Primary Meta Tags -->'+nl
    +'<title>'+title+'</title>'+nl
    +'<meta name="title" content="'+title+'">'+nl
    +'<meta name="description" content="'+desc+'">'+nl
    +(kw?'<meta name="keywords" content="'+kw+'">'+nl:'')
    +(author?'<meta name="author" content="'+author+'">'+nl:'')
    +nl+'<!-- Open Graph -->'+nl
    +'<meta property="og:type" content="website">'+nl
    +'<meta property="og:url" content="'+url+'">'+nl
    +'<meta property="og:title" content="'+title+'">'+nl
    +'<meta property="og:description" content="'+desc+'">'+nl
    +(img?'<meta property="og:image" content="'+img+'">'+nl:'')
    +nl+'<!-- Twitter Card -->'+nl
    +'<meta name="twitter:card" content="summary_large_image">'+nl
    +'<meta name="twitter:url" content="'+url+'">'+nl
    +'<meta name="twitter:title" content="'+title+'">'+nl
    +'<meta name="twitter:description" content="'+desc+'">'+nl
    +(img?'<meta name="twitter:image" content="'+img+'">':'')
  const FIELDS=[['mtg_title',title,setTitle],['mtg_desc',desc,setDesc],['mtg_url',url,setUrl],['mtg_ogimg',img,setImg],['mtg_keywords',kw,setKw],['mtg_author',author,setAuthor]]
  const tool=TOOLS.find(x=>x.slug==='meta-tag-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {FIELDS.map(([lbl,val,set])=>(
            <div key={lbl}><label className="block text-xs font-medium text-gray-600 mb-0.5">{t(lbl)}</label>
              <input value={val} onChange={e=>set(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"/></div>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('mtg_tags')}</label>
          <textarea value={tags} readOnly rows={16} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(tags)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{t('ui_copy')}</button>
      </div>
    </ToolLayout>
  )
}