'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-minifier')!
function minifyHtml(html:string,opts:{comments:boolean;whitespace:boolean;attrs:boolean}):string{
  let r=html
  if(opts.comments)r=r.replace(/<!--(?!\[if)[\s\S]*?-->/g,'')
  if(opts.whitespace){
    r=r.replace(/\s+/g,' ')
    r=r.replace(/> </g,'><')
    r=r.replace(/\s+</g,'<')
    r=r.replace(/>\s+/g,'>')
  }
  if(opts.attrs){
    r=r.replace(/ (class|id|style)=\s*["']\s*["']/g,'')
    r=r.replace(/\s+=/g,'=')
    r=r.replace(/=\s+/g,'=')
  }
  return r.trim()
}
export default function HtmlMinifierPage() {
  const [input,setInput]=useState('<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <!-- Page title -->\n    <title>  Hello World  </title>\n  </head>\n  <body>\n    <h1 class="  title  ">Hello</h1>\n    <p>  World  </p>\n  </body>\n</html>')
  const [opts,setOpts]=useState({comments:true,whitespace:true,attrs:false})
  const [copied,setCopied]=useState(false)
  const output=input?minifyHtml(input,opts):''
  const savings=input?Math.round((1-output.length/input.length)*100):0
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {([['comments','Remove comments'],['whitespace','Collapse whitespace'],['attrs','Clean attributes']] as [keyof typeof opts,string][]).map(([k,label])=>(
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={opts[k]} onChange={e=>setOpts({...opts,[k]:e.target.checked})} className="rounded"/>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Input HTML</label>
              <span className="text-xs text-gray-400">{input.length} chars</span>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={12}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Minified Output</label>
              <div className="flex items-center gap-2">
                {savings>0&&<span className="text-xs text-green-600 font-semibold">-{savings}%</span>}
                <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
              </div>
            </div>
            <textarea readOnly value={output} rows={12}
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          </div>
        </div>
        {input&&<div className="bg-gray-50 rounded-lg p-3 flex gap-6 text-sm text-gray-600">
          <span>Original: <strong>{input.length}</strong> chars</span>
          <span>Minified: <strong>{output.length}</strong> chars</span>
          <span>Saved: <strong className="text-green-600">{savings}%</strong></span>
        </div>}
      </div>
    </ToolLayout>
  )
}