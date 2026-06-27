'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('morse-code-translator')!
const MORSE:Record<string,string>={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',0:'-----','.':'.-.-.-',',':'--..--','?':'..--..','/':'-..-.','-':'-....-','(':'-.--.',')':"-.--.-",' ':'/'}
const R_MORSE:Record<string,string>=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))
function toMorse(t:string):string{return t.toUpperCase().split('').map(c=>MORSE[c]||'?').join(' ')}
function fromMorse(m:string):string{
  return m.split(' / ').map(w=>w.split(' ').map(c=>R_MORSE[c]||'?').join('')).join(' ')
}
export default function MorseCodeTranslatorPage() {
  const t = useTranslations('toolui')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [input,setInput]=useState('Hello World')
  const [isPlaying,setIsPlaying]=useState(false)
  const acRef=useRef<AudioContext|null>(null)
  const output=mode==='encode'?toMorse(input):fromMorse(input)
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const playMorse=async()=>{
    if(isPlaying)return
    const morseStr=mode==='encode'?toMorse(input):input
    if(!acRef.current)acRef.current=new AudioContext()
    const ac=acRef.current
    setIsPlaying(true)
    const dot=0.06,dash=dot*3,sym=dot,char=dot*3,word=dot*7
    let t=ac.currentTime+0.1
    for(const ch of morseStr){
      if(ch==='.'||ch==='-'){
        const osc=ac.createOscillator(),gain=ac.createGain()
        osc.frequency.value=600;osc.connect(gain);gain.connect(ac.destination)
        const dur=ch==='.'?dot:dash
        gain.gain.setValueAtTime(0.3,t);osc.start(t);osc.stop(t+dur)
        t+=dur+sym
      }else if(ch===' '){t+=char-sym
      }else if(ch==='/'){t+=word-sym}
    }
    setTimeout(()=>setIsPlaying(false),(t-ac.currentTime)*1000+100)
  }
  const morseForDisplay=mode==='encode'?output:input
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('mc_encode')}</button>
          <button onClick={()=>setMode('decode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('mc_decode')}</button>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('ui_input')}</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3}
            placeholder={mode==='encode'?t('mc_ph_enc'):t('mc_ph_dec')}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono resize-none"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">{t('ui_output')}</label>
            <div className="flex gap-2">
              <button onClick={playMorse} disabled={isPlaying} className={'px-3 py-1 rounded text-xs font-medium border transition '+(isPlaying?'bg-gray-100 text-gray-400':'border-green-300 text-green-700 hover:bg-green-50')}>
                {isPlaying?t('mc_playing'):t('mc_play')}
              </button>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>
            </div>
          </div>
          <textarea readOnly value={output} rows={3} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono resize-none text-sm"/>
        </div>
        {morseForDisplay&&(
          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-2">{t('mc_visual')}</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {morseForDisplay.split(' ').map((sym,i)=>
                sym==='/'?(
                  <span key={i} className="text-gray-500 text-xs mx-1">{t('mc_space')}</span>
                ):(
                  <div key={i} className="flex gap-0.5">
                    {sym.split('').map((c,j)=>
                      c==='.'?<div key={j} className="w-2 h-2 bg-yellow-400 rounded-full"/>
                       :c==='-'?<div key={j} className="w-6 h-2 bg-yellow-400 rounded"/>
                       :null
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {Object.entries(MORSE).slice(0,26).map(([k,v])=>(
            <div key={k} className="flex items-center gap-1.5 bg-gray-50 rounded px-1.5 py-1">
              <span className="font-bold text-gray-700 w-4">{k}</span>
              <span className="font-mono text-gray-500">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}