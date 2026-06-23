'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('lorem-ipsum-generator')!
const LOREM_WORDS=['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum','at','vero','eos','accusamus','iusto','odio','dignissimos','ducimus','blanditiis','praesentium','voluptatum','deleniti','atque','corrupti','quos','quas','molestias','excepturi','occaecati','autem','vel','eum','iure','reprehenderit']
function rnd(min:number,max:number):number{return Math.floor(Math.random()*(max-min+1))+min}
function word():string{return LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]}
function sentence():string{
  const len=rnd(8,18)
  const words=[word().charAt(0).toUpperCase()+word().slice(1),...Array.from({length:len-1},word)]
  if(rnd(0,4)===0)words.splice(rnd(2,words.length-2),0,',')
  return words.join(' ')+'.'
}
function paragraph(sentCount:number):string{return Array.from({length:sentCount},sentence).join(' ')}
export default function LoremIpsumGeneratorPage() {
  const [type,setType]=useState<'paragraphs'|'sentences'|'words'>('paragraphs')
  const [count,setCount]=useState(3)
  const [startLorem,setStartLorem]=useState(true)
  const [output,setOutput]=useState('')
  const [copied,setCopied]=useState(false)
  const generate=()=>{
    let result=''
    if(type==='paragraphs'){
      const paras=Array.from({length:count},()=>paragraph(rnd(3,6)))
      if(startLorem)paras[0]='Lorem ipsum dolor sit amet, consectetur adipiscing elit. '+paras[0]
      result=paras.join('\n
')\n    }else if(type==='sentences'){
      const sents=Array.from({length:count},sentence)
      if(startLorem)sents[0]='Lorem ipsum dolor sit amet.'
      result=sents.join(' ')
    }else{
      const words=Array.from({length:count},word)
      if(startLorem){words[0]='Lorem';words[1]='ipsum'}
      result=words.join(' ')
    }
    setOutput(result)
  }
  const copy=()=>{if(output){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {(['paragraphs','sentences','words'] as const).map(t=>(
              <button key={t} onClick={()=>setType(t)} className={'px-3 py-2 text-sm font-medium capitalize transition '+(type===t?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Count:</span>
            <input type="number" value={count} onChange={e=>setCount(Math.max(1,Math.min(50,Number(e.target.value))))} min="1" max="50" className="w-16 rounded border border-gray-300 px-2 py-1.5 text-center text-sm"/>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={startLorem} onChange={e=>setStartLorem(e.target.checked)} className="rounded"/>
            <span className="text-sm text-gray-600">Start with Lorem ipsum</span>
          </label>
        </div>
        <button onClick={generate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          Generate
        </button>
        {output&&(
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">{output.split(/s+/).filter(Boolean).length} words</p>
              <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'Copied!':'Copy all'}</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">{output}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}