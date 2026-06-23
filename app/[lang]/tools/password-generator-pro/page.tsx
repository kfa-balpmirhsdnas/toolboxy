'use client'
import {useState,useCallback} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const CHARS={
  upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:'abcdefghijklmnopqrstuvwxyz',
  digits:'0123456789',
  symbols:'!@#$%^&*()-_=+[]{}|;:,.<>?'
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='password-generator-pro')
  const [len,setLen]=useState(16)
  const [opts,setOpts]=useState({upper:true,lower:true,digits:true,symbols:false})
  const [count,setCount]=useState(5)
  const [passwords,setPasswords]=useState<string[]>([])
  const [copied,setCopied]=useState(-1)

  const generate=useCallback(()=>{
    let charset=''
    if(opts.upper) charset+=CHARS.upper
    if(opts.lower) charset+=CHARS.lower
    if(opts.digits) charset+=CHARS.digits
    if(opts.symbols) charset+=CHARS.symbols
    if(!charset) return
    const arr=Array.from({length:count},()=>
      Array.from({length:len},()=>charset[Math.floor(Math.random()*charset.length)]).join('')
    )
    setPasswords(arr)
  },[len,opts,count])

  function copy(p:string,i:number){
    navigator.clipboard.writeText(p)
    setCopied(i)
    setTimeout(()=>setCopied(-1),1500)
  }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <label className='text-sm flex items-center gap-2'>
            Length: {len}
            <input type='range' min={8} max={64} value={len} onChange={e=>setLen(Number(e.target.value))} className='w-32'/>
          </label>
          <label className='text-sm flex items-center gap-2'>
            Count:
            <select value={count} onChange={e=>setCount(Number(e.target.value))} className='border rounded px-2 py-1'>
              {[1,5,10,20].map(n=>(<option key={n} value={n}>{n}</option>))}
            </select>
          </label>
        </div>
        <div className='flex gap-4 flex-wrap'>
          {(Object.keys(opts) as Array<keyof typeof opts>).map(k=>(
            <label key={k} className='flex items-center gap-2 text-sm capitalize'>
              <input type='checkbox' checked={opts[k]} onChange={e=>setOpts(o=>({...o,[k]:e.target.checked}))}/>
              {k}
            </label>
          ))}
        </div>
        <button onClick={generate}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Generate</button>
        <div className='space-y-2'>
          {passwords.map((p,i)=>(
            <div key={i} className='flex items-center gap-2 border rounded p-2'>
              <code className='flex-1 font-mono text-sm break-all'>{p}</code>
              <button onClick={()=>copy(p,i)}
                className='text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 shrink-0'>
                {copied===i?'Copied!':'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}