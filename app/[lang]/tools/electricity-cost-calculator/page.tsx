'use client'
import { useState } from 'react'

const APPLIANCES=[
  {name:'Refrigerator',watts:150},{name:'Air conditioner',watts:1500},{name:'Electric heater',watts:1500},
  {name:'Washing machine',watts:500},{name:'Clothes dryer',watts:4000},{name:'Dishwasher',watts:1800},
  {name:'Microwave',watts:1200},{name:'Electric oven',watts:2400},{name:'Coffee maker',watts:1000},
  {name:'LED TV (55\")',watts:80},{name:'Desktop computer',watts:200},{name:'Laptop',watts:50},
  {name:'LED bulb',watts:10},{name:'Incandescent bulb',watts:60},{name:'Electric water heater',watts:4000},
  {name:'Hair dryer',watts:1800},{name:'Vacuum cleaner',watts:1000},{name:'Phone charger',watts:5},
]

type Device={id:number;name:string;watts:string;hoursDay:string}

export default function ElectricityCostCalculatorPage() {
  const [devices,setDevices]=useState<Device[]>([{id:1,name:'LED TV (55\")',watts:'80',hoursDay:'4'}])
  const [rate,setRate]=useState('0.13')
  const [nextId,setNextId]=useState(2)

  function addDevice(){setDevices(d=>[...d,{id:nextId,name:'',watts:'',hoursDay:'1'}]);setNextId(n=>n+1)}
  function removeDevice(id:number){setDevices(d=>d.filter(x=>x.id!==id))}
  function updateDevice(id:number,field:keyof Device,val:string){setDevices(d=>d.map(x=>x.id===id?{...x,[field]:val}:x))}

  const rateNum=parseFloat(rate)||0
  const totals=devices.map(d=>({
    ...d,
    kwhDay:(parseFloat(d.watts)||0)*(parseFloat(d.hoursDay)||0)/1000,
    costDay:(parseFloat(d.watts)||0)*(parseFloat(d.hoursDay)||0)/1000*rateNum,
  }))
  const totalKwhDay=totals.reduce((s,d)=>s+d.kwhDay,0)
  const totalCostDay=totals.reduce((s,d)=>s+d.costDay,0)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Electricity Cost Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate electricity cost for your appliances and devices</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Rate ($/kWh)</label>
            <input type="number" value={rate} onChange={e=>setRate(e.target.value)} step={0.01} placeholder="0.13"
              className="w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="space-y-2">
            {devices.map(d=>(
              <div key={d.id} className="flex gap-2 items-center">
                <div className="flex-1 min-w-0">
                  <select value={d.name} onChange={e=>{updateDevice(d.id,'name',e.target.value);const a=APPLIANCES.find(x=>x.name===e.target.value);if(a)updateDevice(d.id,'watts',String(a.watts))}}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select or type...</option>
                    {APPLIANCES.map(a=><option key={a.name} value={a.name}>{a.name} ({a.watts}W)</option>)}
                  </select>
                </div>
                <input type="number" value={d.watts} onChange={e=>updateDevice(d.id,'watts',e.target.value)} placeholder="W"
                  className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="number" value={d.hoursDay} onChange={e=>updateDevice(d.id,'hoursDay',e.target.value)} placeholder="h/d" min={0} max={24}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={()=>removeDevice(d.id)} className="text-gray-400 hover:text-red-500 text-lg px-1">\u00D7</button>
              </div>
            ))}
          </div>
          <button onClick={addDevice} className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">+ Add Device</button>
        </div>
        {totalKwhDay>0&&(
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Per Day',totalCostDay.toFixed(2)],['Per Week',(totalCostDay*7).toFixed(2)],['Per Month',(totalCostDay*30).toFixed(2)],['Per Year',(totalCostDay*365).toFixed(0)]].map(([l,v])=>(
              <div key={l} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-brand-600">${v}</div>
                <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                <div className="text-xs text-gray-400">{(totalKwhDay*(l==='Per Day'?1:l==='Per Week'?7:l==='Per Month'?30:365)).toFixed(1)} kWh</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}