'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='electricity-cost-calculator')
  const [watts,setWatts]=useState('100')
  const [hours,setHours]=useState('8')
  const [rate,setRate]=useState('0.12')
  const [days,setDays]=useState('30')

  const w=parseFloat(watts)||0
  const h=parseFloat(hours)||0
  const r=parseFloat(rate)||0
  const d=parseFloat(days)||0

  const daily=(w/1000)*h*r
  const monthly=daily*d
  const yearly=daily*365

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4 max-w-md">
        {[
          {label:'Power (Watts)',val:watts,set:setWatts,placeholder:'e.g. 100'},
          {label:'Hours Used Per Day',val:hours,set:setHours,placeholder:'e.g. 8'},
          {label:'Electricity Rate ($/kWh)',val:rate,set:setRate,placeholder:'e.g. 0.12'},
          {label:'Days Per Month',val:days,set:setDays,placeholder:'e.g. 30'},
        ].map(({label,val,set,placeholder})=>(
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input type="number" value={val} onChange={e=>set(e.target.value)}
              placeholder={placeholder}
              className="w-full border rounded px-3 py-2"/>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            {label:'Daily',val:daily},
            {label:'Monthly',val:monthly},
            {label:'Yearly',val:yearly},
          ].map(({label,val})=>(
            <div key={label} className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-xl font-bold text-blue-700">${val.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Formula: (Watts / 1000) × Hours × Rate × Days</p>
      </div>
    </ToolLayout>
  )
}
