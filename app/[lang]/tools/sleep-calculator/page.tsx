'use client'
import { useState } from 'react'

// Sleep cycle ~90 min. Fall asleep ~14 min average.
const CYCLE_MIN=90
const FALL_ASLEEP=14
const CYCLES=[5,6,7,8] // 7.5h, 9h, etc

function pad(n:number){return String(n).padStart(2,'0')}
function fmtTime(date:Date):string{
  const h=date.getHours(),m=date.getMinutes()
  const ampm=h>=12?'PM':'AM'
  return pad(h%12||12)+':'+pad(m)+' '+ampm
}

export default function SleepCalculatorPage() {
  const [mode,setMode]=useState<'wakeup'|'bedtime'>('wakeup')
  const [time,setTime]=useState('')

  const times:Date[]=[]
  if(time){
    const [h,m]=time.split(':').map(Number)
    const base=new Date();base.setHours(h,m,0,0)
    if(mode==='wakeup'){
      // Work backwards: wakeup - N cycles - fall asleep time
      CYCLES.slice().reverse().forEach(c=>{
        const d=new Date(base.getTime()-(c*CYCLE_MIN+FALL_ASLEEP)*60000)
        times.push(d)
      })
    }else{
      // Work forwards: bedtime + fall asleep + N cycles
      CYCLES.forEach(c=>{
        const d=new Date(base.getTime()+(c*CYCLE_MIN+FALL_ASLEEP)*60000)
        times.push(d)
      })
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sleep Calculator</h1>
        <p className="text-gray-500 mb-8">Find the ideal sleep or wake-up times based on 90-minute sleep cycles</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={()=>setMode('wakeup')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='wakeup'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>I want to wake up at...</button>
            <button onClick={()=>setMode('bedtime')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='bedtime'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>I want to sleep at...</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{mode==='wakeup'?'Wake-up time':'Bedtime'}</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <p className="text-xs text-gray-400">Assumes ~14 minutes to fall asleep. Each sleep cycle is 90 minutes.</p>
        </div>
        {times.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">{mode==='wakeup'?'Ideal bedtimes \u2192 wake up at '+fmtTime(new Date(`2000-01-01T${time}`)):'Wake-up times \u2192 go to bed at '+fmtTime(new Date(`2000-01-01T${time}`))}</h2>
            <div className="space-y-2">
              {times.map((t,i)=>(
                <div key={i} className={'flex items-center justify-between px-4 py-3 rounded-xl border '+(i===1||i===2?'border-brand-300 bg-brand-50':'bg-gray-50 border-gray-200')}>
                  <span className="text-xl font-bold font-mono text-gray-900">{fmtTime(t)}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-600">{CYCLES[mode==='wakeup'?CYCLES.length-1-i:i]} cycles</span>
                    <p className="text-xs text-gray-400">{(CYCLES[mode==='wakeup'?CYCLES.length-1-i:i]*90/60).toFixed(1)}h of sleep</p>
                  </div>
                  {(i===1||i===2)&&<span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}