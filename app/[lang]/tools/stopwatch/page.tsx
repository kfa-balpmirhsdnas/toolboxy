'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('stopwatch')!
function fmt(ms:number):string{
  const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10)
  return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0')
}
export default function StopwatchPage() {
  const t = useTranslations('toolui')
  const [elapsed,setElapsed]=useState(0)
  const [running,setRunning]=useState(false)
  const [laps,setLaps]=useState<number[]>([])
  const startRef=useRef<number>(0)
  const baseRef=useRef<number>(0)
  const rafRef=useRef<number>(0)
  const tick=()=>{setElapsed(baseRef.current+Date.now()-startRef.current);rafRef.current=requestAnimationFrame(tick)}
  const start=()=>{startRef.current=Date.now();setRunning(true);rafRef.current=requestAnimationFrame(tick)}
  const pause=()=>{baseRef.current+=Date.now()-startRef.current;setRunning(false);cancelAnimationFrame(rafRef.current)}
  const reset=()=>{cancelAnimationFrame(rafRef.current);setRunning(false);setElapsed(0);baseRef.current=0;setLaps([])}
  const lap=()=>{if(running)setLaps(l=>[elapsed,...l])}
  useEffect(()=>()=>{cancelAnimationFrame(rafRef.current)},[])
  const best=laps.length>1?Math.min(...laps.map((l,i,arr)=>i<arr.length-1?l-arr[i+1]:l)):null
  const worst=laps.length>1?Math.max(...laps.map((l,i,arr)=>i<arr.length-1?l-arr[i+1]:l)):null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-6 text-center">
        <div className="bg-gray-900 rounded-3xl py-10 px-6">
          <p className="text-5xl font-bold font-mono tabular-nums text-white tracking-wide">{fmt(elapsed)}</p>
          {laps.length>0&&<p className="text-gray-400 text-sm mt-2 font-mono">{t('sw_lap')} {laps.length}: {fmt(laps.length>1?laps[0]-laps[1]:laps[0])}</p>}
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50">{t('ic_reset')}</button>
          <button onClick={()=>running?pause():start()} className={'px-10 py-3 rounded-xl font-bold text-lg text-white transition '+(running?'bg-orange-500 hover:bg-orange-600':'bg-green-500 hover:bg-green-600')}>{running?t('sw_pause'):t('sw_start')}</button>
          <button onClick={lap} disabled={!running} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">{t('sw_lap')}</button>
        </div>
        {laps.length>0&&(
          <div className="text-left space-y-1.5">
            <p className="text-xs font-medium text-gray-600 mb-2">{t('sw_history',{n:laps.length})}</p>
            {laps.map((l,i,arr)=>{
              const dur=i<arr.length-1?l-arr[i+1]:l
              const isBest=dur===best,isWorst=dur===worst
              return(
                <div key={i} className={'flex items-center justify-between px-3 py-2 rounded-lg text-sm '+(isBest?'bg-green-50':isWorst?'bg-red-50':'bg-gray-50')}>
                  <span className="text-gray-500">{t('sw_lap')} {laps.length-i}</span>
                  <span className={'font-mono font-semibold '+(isBest?'text-green-600':isWorst?'text-red-600':'text-gray-800')}>{fmt(dur)}</span>
                  <span className="font-mono text-gray-400 text-xs">{fmt(l)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}