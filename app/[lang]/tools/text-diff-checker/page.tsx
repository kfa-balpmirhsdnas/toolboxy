'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function diff(a:string,b:string):{text:string,type:'same'|'add'|'del'}[]{
  const la=a.split('\n'), lb=b.split('\n')
  const result:{text:string,type:'same'|'add'|'del'}[]=[]
  const maxLen=Math.max(la.length,lb.length)
  for(let i=0;i<maxLen;i++){
    const lineA=la[i], lineB=lb[i]
    if(lineA===undefined) result.push({text:lineB,type:'add'})
    else if(lineB===undefined) result.push({text:lineA,type:'del'})
    else if(lineA===lineB) result.push({text:lineA,type:'same'})
    else{
      result.push({text:lineA,type:'del'})
      result.push({text:lineB,type:'add'})
    }
  }
  return result
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='text-diff-checker')
  const [textA,setTextA]=useState('Hello World\nThis is line 2\nThis is line 3')
  const [textB,setTextB]=useState('Hello World\nThis line has changed\nThis is line 3\nNew line added')
  const [compared,setCompared]=useState(false)

  const changes=compared?diff(textA,textB):[]
  const added=changes.filter(c=>c.type==='add').length
  const deleted=changes.filter(c=>c.type==='del').length

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Text A (Original)</label>
            <textarea value={textA} onChange={e=>{setTextA(e.target.value);setCompared(false)}}
              className="w-full h-48 p-3 border rounded font-mono text-sm resize-y"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text B (Modified)</label>
            <textarea value={textB} onChange={e=>{setTextB(e.target.value);setCompared(false)}}
              className="w-full h-48 p-3 border rounded font-mono text-sm resize-y"/>
          </div>
        </div>
        <button onClick={()=>setCompared(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Compare
        </button>
        {compared&&(
          <div>
            <div className="flex gap-4 text-sm mb-2">
              <span className="text-green-600">+{added} added</span>
              <span className="text-red-500">-{deleted} deleted</span>
              <span className="text-gray-500">{changes.filter(c=>c.type==='same').length} unchanged</span>
            </div>
            <div className="border rounded font-mono text-sm overflow-auto max-h-64">
              {changes.map((c,i)=>(
                <div key={i} className={
                  c.type==='add'?'bg-green-50 text-green-800':
                  c.type==='del'?'bg-red-50 text-red-700':'text-gray-700'
                }>
                  <span className="inline-block w-6 text-center select-none opacity-40">
                    {c.type==='add'?'+':c.type==='del'?'-':' '}
                  </span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
