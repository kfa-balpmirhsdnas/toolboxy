'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function mdToHtml(md:string):string{
  let s=md
  s=s.replace(/^### (.+)$/gm,'<h3 class="text-lg font-bold mt-3 mb-1">$1</h3>')
  s=s.replace(/^## (.+)$/gm,'<h2 class="text-xl font-bold mt-4 mb-1">$1</h2>')
  s=s.replace(/^# (.+)$/gm,'<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>')
  s=s.replace(/`(.+?)`/g,'<code class="bg-gray-100 px-1 rounded">$1</code>')
  s=s.replace(/^> (.+)$/gm,'<blockquote class="border-l-4 border-gray-300 pl-3 italic text-gray-600">$1</blockquote>')
  s=s.replace(/^- (.+)$/gm,'<li class="ml-4">$1</li>')
  s=s.replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" class="text-blue-600 underline">$1</a>')
  s=s.replace(/\n\n/g,'<br/><br/>')
  return s
}

const DEMO='# Hello Markdown\n\nThis is **bold** and *italic* text.\n\n- Item one\n- Item two\n\n> A blockquote\n\n[Link](https://toolboxy.net)'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='markdown-preview')
  const [md,setMd]=useState(DEMO)
  return (
    <ToolLayout tool={tool}>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('mdp_md')}</label>
          <textarea value={md} onChange={e=>setMd(e.target.value)}
            className='w-full h-80 p-3 border rounded font-mono text-sm resize-y'/>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('htg_preview')}</label>
          <div className='h-80 p-3 border rounded overflow-auto'
            dangerouslySetInnerHTML={{__html:mdToHtml(md)}}/>
        </div>
      </div>
    </ToolLayout>
  )
}