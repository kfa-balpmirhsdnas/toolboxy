'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const MORSE:Record<string,string>={
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',
  G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',
  M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',
  S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',
  Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--',
  '4':'....-','5':'.....','6':'-....','7':'--...',
  '8':'---..','9':'----.',
}
const REV=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='text-to-morse-code')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [input,setInput]=useState('HELLO WORLD')

  function encode(s:string){
    return s.toUpperCase().split('').map(c=>{
      if(c===' ') return '/'
      return MORSE[c]||'?'
    }).join(' ')
  }

  function decode(s:string){
    return s.split(' / ').map(word=>
      word.split(' ').map(code=>REV[code]||'?').join('')
    ).join(' ')
  }

  const output=mode==='encode'?encode(input):decode(input)

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          {(['encode','decode'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={'px-4 py-2 rounded capitalize '+(mode===m?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
              {m}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-32 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Output</label>
            <textarea readOnly value={output}
              className='w-full h-32 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(output)}
          className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm'>Copy</button>
      </div>
    </ToolLayout>
  )
}