'use client'
import { useState } from 'react'

const WORDS=['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum']

function sentence():string{
  const len=6+Math.floor(Math.random()*12)
  const words=Array.from({length:len},(_,i)=>i===0?WORDS[Math.floor(Math.random()*WORDS.length)].charAt(0).toUpperCase()+WORDS[Math.floor(Math.random()*WORDS.length)].slice(1):WORDS[Math.floor(Math.random()*WORDS.length)])
  return words.join(' ')+'.'
}
function paragraph(sentCount:number):string{
  return Array.from({length:sentCount},()=>sentence()).join(' ')
}

export default function LoremIpsumGeneratorPage() {
  const [type,setType]=useState<'paragraphs'|'sentences'|'words'>('paragraphs')
  const [count,setCount]=useState(3)
  const [startLorem,setStartLorem]=useState(true)
  const [output,setOutput]=useState('')
  const [copied,setCopied]=useState(false)

  function generate(){
    let result=''
    if(type==='words'){
      const ws=Array.from({length:count},()=>WORDS[Math.floor(Math.random()*WORDS.length)])
      result=ws.join(' ')
    } else if(type==='sentences'){
      result=Array.from({length:count},()=>sentence()).join(' ')
    } else {
      result=Array.from({length:count},(_,i)=>paragraph(4+Math.floor(Math.random()*3))).join('\n\n')
    }
    if(startLorem&&type!=='words') result='Lorem ipsum dolor sit amet, consectetur adipiscing elit. '+result.slice(result.indexOf(' ')+1)
    setOutput(result)
  }

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lorem Ipsum Generator</h1>
        <p className="text-gray-500 mb-8">Generate placeholder Lorem Ipsum text for designs and mockups</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            {(['paragraphs','sentences','words'] as const).map(t=>(
              <button key={t} onClick={()=>setType(t)} className={'px-4 py-2 rounded-lg capitalize font-medium transition-colors '+(type===t?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{t}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Count</label>
            <input type="range" min={1} max={type==='paragraphs'?10:type==='sentences'?20:200} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="flex-1" />
            <span className="text-brand-600 font-bold w-8 text-right">{count}</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={startLorem} onChange={e=>setStartLorem(e.target.checked)} className="rounded" />
            <span className="text-sm">Start with \"Lorem ipsum...\"</span>
          </label>
          <button onClick={generate} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            Generate
          </button>
        </div>
        {output&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{output.trim().split(/\s+/).length} words</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        )}
      </div>
    </main>
  )
}