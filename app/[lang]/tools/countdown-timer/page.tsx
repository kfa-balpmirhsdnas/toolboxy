'use client'
import {useState,useEffect,useRef} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [h,setH]=useState(0)
  const [m,setM]=useState(5)
  const [s,setS]=useState(0)
  const [left,setLeft]=useState(0)
  const [running,setRunning]=useState(false)
  const [done,setDone]=useState(false)
  const ref=useRef<ReturnType<typeof setInterval>|null>(null)
  useEffect(()=>{
    if(!running)return
    if(left<=0){setRunning(false);setDone(true);return}
    ref.current=setInterval(()=>setLeft(l=>{if(l<=1){clearInterval(ref.current!);setRunning(false);setDone(true);return 0}return l-1}),1000)
    return()=>clearInterval(ref.current!)
  },[running])
  const start=()=>{const total=h*3600+m*60+s;if(total>0){setLeft(total);setDone(false);setRunning(true)}}
  const fmt=(n:number)=>String(n).padStart(2,'0')
  const lh=Math.floor(left/3600),lm=Math.floor((left%3600)/60),ls=left%60
  const tool=TOOLS.find(t=>t.slug==='countdown-timer')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-6 text-center">
        {!running&&!left?<div className="flex gap-2 justify-center">
          {([['H',h,setH,23],['M',m,setM,59],['S',s,setS,59]] as const).map(([lbl,val,set,max])=>(
            <label key={lbl} className="flex flex-col items-center gap-1 text-sm text-gray-600">{lbl}
              <input type="number" min={0} max={max} value={val} onChange={e=>set(+e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-2 text-center text-xl font-mono"/></label>
          ))}</div>:null}
        {(running||left>0)&&<div className={'text-6xl font-mono font-bold '+(done?'text-red-500':left<10?'text-orange-500':'text-gray-900')}>
          {fmt(lh)}:{fmt(lm)}:{fmt(ls)}</div>}
        {done&&<p className="text-lg font-semibold text-red-500">Time is up!</p>}
        <div className="flex gap-2 justify-center">
          {!running?<button onClick={start} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Start</button>:
            <button onClick={()=>setRunning(false)} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold">Pause</button>}
          <button onClick={()=>{setRunning(false);setLeft(0);setDone(false)}} className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}