'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('morse-code-converter')!
const MORSE:Record<string,string>={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'}
const MORSE_REV=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))
function textToMorse(t:string):string{return t.toUpperCase().split('').map(c=>c===' '?'/':(MORSE[c]||c)).join(' ')}
function morseToText(m:string):string{return m.split(' / ').map(word=>word.split(' ').map(code=>MORSE_REV[code]||code).join('')).join(' ')}
export default function MorseCodeConverterPage() {
  const [text,setText]=useState('Hello World')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [playing,setPlaying]=useState(false)
  const [copied,setCopied]=useState(false)
  const encoded=mode==='encode'?textToMorse(text):morseToText(text)
  const copy=()=>{navigator.clipboard.writeText(encoded);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  const play=async()=>{
    if(playing)return
    const morse=mode==='encode'?textToMorse(text):text
    const ctx=new AudioContext()
    setPlaying(true)
    let t=ctx.currentTime+0.1
    const dot=0.08,dash=0.24,gap=0.08,charGap=0.24,wordGap=0.56
    for(const token of morse.split(' ')){
      if(token==='/'){t+=wordGap;continue}
      for(const sym of token){
        const osc=ctx.createOscillator(),gain=ctx.createGain()
        osc.connect(gain);gain.connect(ctx.destination)
        osc.frequency.value=600
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(0.5,t+0.01)
        const dur=sym==='.'?dot:dash
        gain.gain.setValueAtTime(0.5,t+dur-0.01);gain.gain.linearRampToValueAtTime(0,t+dur)
        osc.start(t);osc.stop(t+dur+gap)
        t+=dur+gap
      }
      t+=charGap
    }
    setTimeout(()=>setPlaying(false),(t-ctx.currentTime)*1000+100)
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['encode','decode'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={'flex-1 py-2 text-sm font-medium capitalize transition '+(mode===m?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>
              {m==='encode'?'Text → Morse':'Morse → Text'}
            </button>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{mode==='encode'?'Text':'Morse code (use spaces, / for word break)'}</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"/></div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">{mode==='encode'?'Morse code':'Decoded text'}</span>
            <div className="flex gap-2">
              {mode==='encode'&&<button onClick={play} disabled={playing}
                className={'text-xs px-3 py-1 rounded text-white transition '+(playing?'bg-gray-600 cursor-not-allowed':'bg-green-600 hover:bg-green-700')}>
                {playing?'Playing...':'▶ Play'}
              </button>}
              <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'✓':'Copy'}</button>
            </div>
          </div>
          <div className="px-4 py-3 text-green-400 font-mono text-sm min-h-16 break-all">{encoded}</div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Morse alphabet reference</p>
          <div className="grid grid-cols-6 gap-1">
            {Object.entries(MORSE).map(([k,v])=>(
              <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                <p className="font-bold text-gray-800 text-sm">{k}</p>
                <p className="font-mono text-xs text-gray-500">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}