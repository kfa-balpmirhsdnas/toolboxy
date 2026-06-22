'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-morse-code')!
const MORSE:Record<string,string>={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.','.':'.-.-.-',',':'--..--','?':'..--..','\'':'.----.','/':'-..-.','-':'-....-','(':'-.--.',')'.'-.--.-',' ':'/'}
const RMORSE=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))
function toMorse(t:string):string{return t.toUpperCase().split('').map(c=>MORSE[c]||'?').join(' ')}
function fromMorse(m:string):string{return m.trim().split(' / ').map(w=>w.split(' ').map(c=>RMORSE[c]||'?').join('')).join(' ')}
export default function TextToMorseCodePage() {
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [text,setText]=useState('Hello World')
  const [morse,setMorse]=useState('.... . .-.. .-.. --- / .-- --- .-. .-.. -..')
  const tResult=mode==='to'?toMorse(text):''
  const mResult=mode==='from'?fromMorse(morse):''
  const play=(code:string)=>{
    const ctx=new (window.AudioContext||(window as unknown as Record<string,unknown>).webkitAudioContext)() as AudioContext
    let t=ctx.currentTime
    const unit=0.08
    code.split(' ').forEach(sym=>{
      if(sym==='/'){t+=unit*3;return}
      const osc=ctx.createOscillator()
      const gain=ctx.createGain()
      osc.connect(gain);gain.connect(ctx.destination)
      osc.frequency.value=600
      const dur=sym==='.'?unit:unit*3
      gain.gain.setValueAtTime(0,t)
      gain.gain.linearRampToValueAtTime(0.3,t+0.005)
      gain.gain.setValueAtTime(0.3,t+dur-0.005)
      gain.gain.linearRampToValueAtTime(0,t+dur)
      osc.start(t);osc.stop(t+dur)
      t+=dur+unit
    })
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('to')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='to'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Text → Morse</button>
          <button onClick={()=>setMode('from')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='from'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Morse → Text</button>
        </div>
        {mode==='to'?(
          <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
            {tResult&&<div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs">Morse Code</span>
                <div className="flex gap-2">
                  <button onClick={()=>play(tResult)} className="text-xs text-amber-400 hover:text-amber-300">Play Sound</button>
                  <button onClick={()=>navigator.clipboard.writeText(tResult)} className="text-xs text-blue-400 hover:text-blue-300">Copy</button>
                </div>
              </div>
              <p className="text-green-400 font-mono text-sm break-all leading-relaxed">{tResult}</p>
            </div>}
          </>
        ):(
          <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Morse Code (use space between chars, / for word break)</label>
              <textarea value={morse} onChange={e=>setMorse(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 font-mono resize-none" spellCheck={false}/>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setMorse(m=>m+'.')} className="px-3 py-2 bg-blue-100 text-blue-700 rounded font-mono text-lg hover:bg-blue-200">·</button>
              <button onClick={()=>setMorse(m=>m+'-')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded font-mono text-lg hover:bg-blue-200">−</button>
              <button onClick={()=>setMorse(m=>m+' ')} className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Space</button>
              <button onClick={()=>setMorse(m=>m+' / ')} className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Word</button>
              <button onClick={()=>setMorse(m=>m.slice(0,-1))} className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">⌫</button>
            </div>
            {mResult&&<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-800">{mResult}</p>
            </div>}
          </>
        )}
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
          <p className="font-medium text-gray-600 mb-1">Reference</p>
          <div className="grid grid-cols-6 gap-1">
            {Object.entries(MORSE).filter(([k])=>/[A-Z0-9]/.test(k)).map(([k,v])=>(
              <div key={k} className="text-center"><span className="font-bold">{k}</span><br/><span className="font-mono">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}