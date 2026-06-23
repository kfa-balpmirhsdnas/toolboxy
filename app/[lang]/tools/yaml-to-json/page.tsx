'use client'
import {useState} from 'react'
import ToolLayout from '@/components/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function pval(v){
  if(v==='true')return true;if(v==='false')return false
  if(v==='null'||v==='~')return null
  if(v!==''&&!isNaN(Number(v)))return Number(v)
  return v.replace(/^["']|["']$/g,'')
}
function parseYaml(yaml){
  const lines=yaml.split('\n'),root={};
  const stack=[{o:root,ind:-1}]
  for(const line of lines){
    if(!line.trim()||line.trim().startsWith('#'))continue
    const ind=line.search(/\S/),content=line.trim()
    while(stack.length>1&&stack[stack.length-1].ind>=ind)stack.pop()
    const cur=stack[stack.length-1].o
    if(content.startsWith('- ')){
      const k=Object.keys(cur).pop()||'';
      if(!Array.isArray(cur[k]))cur[k]=[]
      cur[k].push(pval(content.slice(2)));continue
    }
    const m=content.match(/^([^:]+):\s*(.*)$/)
    if(!m)continue
    const [,key,val]=m,k=key.trim()
    if(!val.trim()){const n={};cur[k]=n;stack.push({o:n,ind})}
    else cur[k]=pval(val.trim())
  }
  return root
}
export default function Page(){
  const [yaml,setYaml]=useState('name: John Doe\nage: 30\nactive: true\naddress:\n  city: New York\n  zip: "10001"\nskills:\n  - JavaScript\n  - Python')
  let json=''
  try{json=JSON.stringify(parseYaml(yaml),null,2)}catch(e){json='Error: '+e.message}
  const tool=TOOLS.find(t=>t.slug==='yaml-to-json')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">YAML Input</label>
            <textarea value={yaml} onChange={e=>setYaml(e.target.value)} rows={14} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">JSON Output</label>
            <textarea value={json} readOnly rows={14} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(json)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy JSON</button>
      </div>
    </ToolLayout>
  )
}