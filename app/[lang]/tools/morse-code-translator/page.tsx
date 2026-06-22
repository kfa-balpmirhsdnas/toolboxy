'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const M:Record<string,string>={
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.',"'":'.----.','-':'-....-','(':'-.--.',')':'-.----','@':'.--.-.'}
const RM=Object.fromEntries(Object.entries(M).map(([k,v])=>[v,k]))

function encode(text:string):string{
  return text.toUpperCase().split('').map(c=>c===' '?'/':(M[c]||'?')).join(' ')
}
function decode(code:string):string{
  return code.split('/ ').map(w=>w.trim().split(' ').map(s=>RM[s]||'?').join('')).join(' ')
}


const tool = getToolBySlug('morse-code-translator')!

export default function MorseCodeTranslatorPage() {
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [text,setText]=useState('HELLO WORLD')
  const [morseIn,setMorseIn]=useState('.... . .-.. .-.. --- / .-- --- .-. .-.. -..')
  const [copied,setCopied]=useState(false)

  const output=mode==='to'?encode(text):decode(morseIn)
  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Morse Code Translator</h1>
        <p className="text-gray-500 mb-8">Translate text to Morse code and Morse code back to text</p>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('to')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='to'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
            Text \u2192 Morse
          </button>
          <button onClick={()=>setMode('from')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='from'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
            Morse \u2192 Text
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {mode==='to'?(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text (letters, numbers, punctuation)</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none uppercase" />
            </div>
          ):(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Morse Code (use space between letters, ' / ' between words)</label>
              <textarea value={morseIn} onChange={e=>setMorseIn(e.target.value)} rows={4}
                placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Result</label>
              <button onClick={copy} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="bg-gray-900 rounded-xl px-4 py-3 font-mono text-green-400 text-sm break-all min-h-[60px]">
              {output}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}