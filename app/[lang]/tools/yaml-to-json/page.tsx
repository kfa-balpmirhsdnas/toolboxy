'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('yaml-to-json')!
function yamlToObj(yaml:string):unknown{
  const lines=yaml.split('
')
  const root:unknown[]=[]
  type Frame={obj:Record<string,unknown>|unknown[];indent:number;key:string|number}
  const stack:Frame[]=[{obj:root as unknown[],indent:-1,key:0}]
  for(let line of lines){
    if(!line.trim()||line.trim().startsWith('#'))continue
    const indent=line.search(/S/)
    const content=line.trim()
    while(stack.length>1&&stack[stack.length-1].indent>=indent)stack.pop()
    const parent=stack[stack.length-1]
    if(content.startsWith('- ')){
      const val=content.slice(2).trim()
      const arr=Array.isArray(parent.obj)?parent.obj:(parent.obj as Record<string,unknown>)[parent.key as string]
      if(!Array.isArray(arr)){
        ;(parent.obj as Record<string,unknown>)[parent.key as string]=[]
      }
      const a=(Array.isArray(parent.obj)?parent.obj:(parent.obj as Record<string,unknown>)[parent.key as string]) as unknown[]
      if(val){a.push(parseVal(val))}
    }else if(content.includes(': ')||content.endsWith(':')){
      const colonIdx=content.indexOf(':')
      const key=content.slice(0,colonIdx).trim().replace(/^['"]|['"]$/g,'')
      const val=content.slice(colonIdx+1).trim().replace(/^['"]|['"]$/g,'')
      const target=Array.isArray(parent.obj)?{}:parent.obj as Record<string,unknown>
      if(Array.isArray(parent.obj)){parent.obj.push(target)}
      if(val){(target as Record<string,unknown>)[key]=parseVal(val)
      }else{
        const child:Record<string,unknown>={}
        ;(target as Record<string,unknown>)[key]=child
        stack.push({obj:target as Record<string,unknown>,indent,key})
        stack.push({obj:child,indent:indent+2,key})
      }
    }
  }
  return root.length===1?root[0]:root
}
function parseVal(v:string):unknown{
  if(v==='true')return true
  if(v==='false')return false
  if(v==='null'||v==='~')return null
  if(!isNaN(Number(v))&&v!=='')return Number(v)
  return v
}
export default function YamlToJsonPage() {
  const [yaml,setYaml]=useState('name: Alice\nage: 30\nactive: true\naddress:\n  city: New York\n  zip: "10001"\ntags:\n  - developer\n  - designer')
  const [indent,setIndent]=useState(2)
  const [mode,setMode]=useState<'yaml2json'|'json2yaml'>('yaml2json')
  const [copied,setCopied]=useState(false)
  const convert=():string=>{
    if(mode==='yaml2json'){
      try{const obj=yamlToObj(yaml);return JSON.stringify(obj,null,indent)}
      catch(e:unknown){return 'Parse error: '+(e instanceof Error?e.message:String(e))}
    }else{
      try{
        const obj=JSON.parse(yaml)
        const toYaml=(v:unknown,lvl:number):string=>{
          const pad=' '.repeat(lvl*2)
          if(v===null)return 'null'
          if(typeof v==='boolean'||typeof v==='number')return String(v)
          if(typeof v==='string')return v.includes('
')?'"'+v.replace(/"/g,'\"')+'"':v
          if(Array.isArray(v))return '
'+v.map((i)=>pad+'- '+toYaml(i,lvl+1)).join('
')
          return '
'+Object.entries(v as Record<string,unknown>).map(([k,val])=>pad+k+': '+toYaml(val,lvl+1)).join('
')
        }
        return Object.entries(obj as Record<string,unknown>).map(([k,v])=>k+': '+toYaml(v,1)).join('
')
      }catch(e:unknown){return 'Invalid JSON: '+(e instanceof Error?e.message:String(e))}
    }
  }
  const output=convert()
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button onClick={()=>setMode('yaml2json')} className={'flex-1 px-4 py-2 text-sm font-medium transition whitespace-nowrap '+(mode==='yaml2json'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>YAML to JSON</button>
            <button onClick={()=>setMode('json2yaml')} className={'flex-1 px-4 py-2 text-sm font-medium transition whitespace-nowrap '+(mode==='json2yaml'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>JSON to YAML</button>
          </div>
          {mode==='yaml2json'&&(
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Indent:</span>
              {[2,4].map(n=>(
                <button key={n} onClick={()=>setIndent(n)}
                  className={'w-9 h-8 rounded border font-mono transition '+(indent===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{n}</button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{mode==='yaml2json'?'YAML':'JSON'} Input</label>
            <textarea value={yaml} onChange={e=>setYaml(e.target.value)} rows={12}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{mode==='yaml2json'?'JSON':'YAML'} Output</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={12} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}