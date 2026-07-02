'use client'
import {useState,useEffect,useRef} from 'react'
import {useTranslations} from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const TIME_PRESETS=[5,10,15,30,60]
const SITU=[{min:30,key:'ct_nap',emoji:'😴'},{min:3,key:'ct_meditate',emoji:'🧘'}]

export default function Page(){
  const t=useTranslations('toolui')
  const [h,setH]=useState(0)
  const [m,setM]=useState(5)
  const [s,setS]=useState(0)
  const [left,setLeft]=useState(0)
  const [running,setRunning]=useState(false)
  const [done,setDone]=useState(false)
  const ref=useRef<ReturnType<typeof setInterval>|null>(null)
  // Audio must be unlocked by a user gesture (the Start/preset click) to be allowed to
  // play later when the timer ends. Generate the beep with the Web Audio API (no asset).
  const ctxRef=useRef<AudioContext|null>(null)
  const beepRef=useRef<ReturnType<typeof setInterval>|null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ensureAudio=()=>{if(!ctxRef.current)ctxRef.current=new (window.AudioContext||(window as any).webkitAudioContext)();ctxRef.current.resume()}
  const beep=()=>{const ctx=ctxRef.current;if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=880;o.connect(g);g.connect(ctx.destination);const now=ctx.currentTime;g.gain.setValueAtTime(0.001,now);g.gain.exponentialRampToValueAtTime(0.4,now+0.02);g.gain.exponentialRampToValueAtTime(0.001,now+0.4);o.start(now);o.stop(now+0.42)}
  useEffect(()=>{
    if(!running)return
    if(left<=0){setRunning(false);setDone(true);return}
    ref.current=setInterval(()=>setLeft(l=>{if(l<=1){clearInterval(ref.current!);setRunning(false);setDone(true);return 0}return l-1}),1000)
    return()=>clearInterval(ref.current!)
  },[running])
  // Ring when finished — repeats until reset/start, auto-stops after 30s so it can't ring forever.
  useEffect(()=>{
    if(!done)return
    beep()
    beepRef.current=setInterval(beep,800)
    const stopAt=setTimeout(()=>{if(beepRef.current){clearInterval(beepRef.current);beepRef.current=null}},30000)
    return()=>{if(beepRef.current)clearInterval(beepRef.current);clearTimeout(stopAt)}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[done])
  const start=()=>{ensureAudio();const total=h*3600+m*60+s;if(total>0){setLeft(total);setDone(false);setRunning(true)}}
  const preset=(min:number)=>{ensureAudio();setH(Math.floor(min/60));setM(min%60);setS(0);setLeft(min*60);setDone(false);setRunning(true)}
  const fmt=(n:number)=>String(n).padStart(2,'0')
  const lh=Math.floor(left/3600),lm=Math.floor((left%3600)/60),ls=left%60
  const tool=TOOLS.find(t=>t.slug==='countdown-timer')!
  const label=(min:number)=>min>=60?t('ct_hour',{n:min/60}):t('ct_min',{n:min})
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-6 text-center">
        {!running&&!left?<>
          <div className="flex gap-2 justify-center">
            {([['H',h,setH,23],['M',m,setM,59],['S',s,setS,59]] as const).map(([lbl,val,set,max])=>(
              <label key={lbl} className="flex flex-col items-center gap-1 text-sm text-gray-600">{lbl}
                <input type="number" min={0} max={max} value={val} onChange={e=>set(+e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-2 text-center text-xl font-mono"/></label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {TIME_PRESETS.map(min=>(
              <button key={min} onClick={()=>preset(min)} className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600">{label(min)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SITU.map(p=>(
              <button key={p.key} onClick={()=>preset(p.min)} className="px-3 py-1.5 text-sm rounded-full bg-gray-50 border border-gray-200 text-gray-700 hover:border-blue-400">{p.emoji} {t(p.key)} <span className="text-gray-400">{t('ct_min',{n:p.min})}</span></button>
            ))}
          </div>
        </>:null}
        {(running||left>0)&&<div className={'text-6xl font-mono font-bold '+(done?'text-red-500':left<10?'text-orange-500':'text-gray-900')}>
          {fmt(lh)}:{fmt(lm)}:{fmt(ls)}</div>}
        {done&&<p className="text-lg font-semibold text-red-500">{t('ct_timeup')}</p>}
        <div className="flex gap-2 justify-center">
          {!running?<button onClick={start} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">{t('ct_start')}</button>:
            <button onClick={()=>setRunning(false)} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold">{t('ct_pause')}</button>}
          <button onClick={()=>{setRunning(false);setLeft(0);setDone(false)}} className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">{t('ct_reset')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}
