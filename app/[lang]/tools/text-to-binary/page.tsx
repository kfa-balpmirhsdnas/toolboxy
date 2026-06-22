'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

type Mode = 'binary'|'hex'|'octal'|'decimal'
type Dir = 'toCode'|'toText'

function textToCode(text: string, mode: Mode): string {
  return Array.from(text).map(ch => {
    const n = ch.codePointAt(0) ?? 0
    if (mode==='binary') return n.toString(2).padStart(8,'0')
    if (mode==='hex') return n.toString(16).toUpperCase().padStart(2,'0')
    if (mode==='octal') return n.toString(8).padStart(3,'0')
    return String(n)
  }).join(' ')
}

function codeToText(code: string, mode: Mode): string {
  try {
    return code.trim().split(/\s+/).map(p => {
      const n = mode==='binary'?parseInt(p,2):mode==='hex'?parseInt(p,16):mode==='octal'?parseInt(p,8):parseInt(p,10)
      return isNaN(n)||n<0||n>1114111?'?':String.fromCodePoint(n)
    }).join('')
  } catch { return '' }
}

const MODES = [
  {value:'binary' as Mode,label:'Binary',ex:'01001000 01101001'},
  {value:'hex' as Mode,label:'Hex',ex:'48 65 6C 6C 6F'},
  {value:'octal' as Mode,label:'Octal',ex:'110 145 154 154 157'},
  {value:'decimal' as Mode,label:'Decimal',ex:'72 101 108 108 111'},
]


const tool = getToolBySlug('text-to-binary')!

export default function TextToBinary() {
  const [mode,setMode] = useState<Mode>('binary')
  const [dir,setDir] = useState<Dir>('toCode')
  const [input,setInput] = useState('Hello, World!')
  const [copied,setCopied] = useState(false)
  const output = dir==='toCode'?textToCode(input,mode):codeToText(input,mode)
  const m = MODES.find(x=>x.value===mode)!
  const swap = () => { setInput(output); setDir(d=>d==='toCode'?'toText':'toCode') }
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text to Binary Converter</h1>
        <p className="text-gray-500 mb-8">Convert text to Binary, Hex, Octal, or Decimal — and back.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Output Format</label>
          <div className="grid grid-cols-4 gap-2">
            {MODES.map(x=>(
              <button key={x.value} onClick={()=>setMode(x.value)} className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${mode===x.value?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{x.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={()=>setDir('toCode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dir==='toCode'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Text → {m.label}</button>
          <button onClick={swap} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600">⇄</button>
          <button onClick={()=>setDir('toText')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dir==='toText'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{m.label} → Text</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{dir==='toCode'?'Text Input':m.label+' Input'}</span>
            {dir==='toText' && <span className="text-xs text-gray-400">Space-separated: {m.ex}</span>}
          </div>
          <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={5} spellCheck={false}/>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{dir==='toCode'?m.label+' Output':'Text Output'}</span>
            <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium transition-colors">{copied?'✓ Copied!':'Copy'}</button>
          </div>
          <div className="p-5 min-h-[80px]">
            <p className="font-mono text-sm text-gray-700 break-all whitespace-pre-wrap">{output||<span className="text-gray-400">Output will appear here...</span>}</p>
          </div>
        </div>
        {input && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[{l:'Input chars',v:input.length},{l:'Output tokens',v:dir==='toCode'?output.split(' ').length:output.length},{l:'Expansion',v:dir==='toCode'?(output.length/Math.max(input.length,1)).toFixed(1)+'x':'-'}].map(s=>(
              <div key={s.l} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{s.v}</div>
                <div className="text-xs text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}