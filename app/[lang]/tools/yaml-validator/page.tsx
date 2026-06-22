'use client'
import { useState } from 'react'

// Lightweight YAML parser using JSON fallback + basic YAML detection
function validateYaml(input:string):{valid:boolean;error:string;lines:number;keys:number;preview:string}{
  const lines=input.trim().split('\n').length
  if(!input.trim()) return{valid:false,error:'Empty input',lines:0,keys:0,preview:''}

  // Count top-level keys (lines starting with non-space key: pattern)
  const keys=input.split('\n').filter(l=>/^[a-zA-Z_][\w-]*\s*:/.test(l)).length

  // Basic YAML validation checks
  const errors:string[]=[]
  const lns=input.split('\n')
  lns.forEach((line,i)=>{
    // Check for tabs (YAML doesn't allow tabs for indentation)
    if(/^\t/.test(line)) errors.push(`Line ${i+1}: YAML does not allow tab indentation`)
    // Check for unclosed quotes
    const singleQ=(line.match(/'/g)||[]).length
    const doubleQ=(line.match(/"/g)||[]).length
    if(singleQ%2!==0) errors.push(`Line ${i+1}: Unclosed single quote`)
    if(doubleQ%2!==0) errors.push(`Line ${i+1}: Unclosed double quote`)
  })

  if(errors.length>0) return{valid:false,error:errors[0],lines,keys,preview:''}

  // Try to convert YAML to structured preview (basic key:value)
  const preview=lns.slice(0,20).map(l=>{
    if(/^\s*#/.test(l)) return l // comment
    if(/^\s*-\s/.test(l)) return l // list item
    return l
  }).join('\n')

  return{valid:true,error:'',lines,keys,preview}
}

const SAMPLE=`# Server configuration
server:
  host: localhost
  port: 8080
  debug: true

database:
  url: postgres://localhost/mydb
  pool_size: 10
  timeout: 30s

features:
  - authentication
  - logging
  - metrics`

export default function YamlValidatorPage() {
  const [input,setInput]=useState(SAMPLE)
  const [copied,setCopied]=useState(false)

  const {valid,error,lines,keys}=validateYaml(input)

  function copy(){navigator.clipboard.writeText(input);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function format(){
    // Normalize indentation to 2 spaces
    const normalized=input.split('\n').map(l=>{
      const indent=l.match(/^(\s*)/)?.[1]||''
      const spaces=' '.repeat(Math.floor(indent.replace(/\t/g,'  ').length/2)*2)
      return spaces+l.trimStart()
    }).join('\n')
    setInput(normalized)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YAML Validator</h1>
        <p className="text-gray-500 mb-6">Validate and inspect YAML syntax in real time</p>
        <div className="flex items-center gap-3 mb-3">
          <div className={'flex items-center gap-1.5 text-sm font-medium '+(valid?'text-green-600':'text-red-500')}>
            <span className="text-lg">{valid?'\u2713':'\u00D7'}</span>
            {valid?'Valid YAML':'Invalid YAML'}
          </div>
          {input&&<span className="text-xs text-gray-400">{lines} lines · {keys} top-level keys</span>}
          <div className="flex gap-2 ml-auto">
            <button onClick={format} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">Normalize</button>
            <button onClick={copy} className="text-xs px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg">{copied?'\u2713':'Copy'}</button>
            <button onClick={()=>setInput(SAMPLE)} className="text-xs text-brand-600 hover:underline">Example</button>
          </div>
        </div>
        {!valid&&error&&(
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-600">{error}</div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex">
            <div className="bg-gray-50 text-gray-400 text-xs font-mono px-3 py-4 text-right select-none border-r border-gray-100" style={{lineHeight:'1.6rem'}}>
              {input.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={20}
              className="flex-1 p-4 font-mono text-sm focus:outline-none resize-none" style={{lineHeight:'1.6rem'}} />
          </div>
        </div>
      </div>
    </main>
  )
}