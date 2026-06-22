'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('unit-converter')!
type U={label:string;tb:(v:number)=>number;fb:(v:number)=>number}
type C={name:string;units:U[]}
const CATS:C[]=[
  {name:'Length',units:[
    {label:'Meter',tb:v=>v,fb:v=>v},{label:'Kilometer',tb:v=>v*1000,fb:v=>v/1000},
    {label:'Centimeter',tb:v=>v/100,fb:v=>v*100},{label:'Millimeter',tb:v=>v/1000,fb:v=>v*1000},
    {label:'Mile',tb:v=>v*1609.344,fb:v=>v/1609.344},{label:'Yard',tb:v=>v*0.9144,fb:v=>v/0.9144},
    {label:'Foot',tb:v=>v*0.3048,fb:v=>v/0.3048},{label:'Inch',tb:v=>v*0.0254,fb:v=>v/0.0254},
  ]},
  {name:'Weight',units:[
    {label:'Kilogram',tb:v=>v,fb:v=>v},{label:'Gram',tb:v=>v/1000,fb:v=>v*1000},
    {label:'Pound',tb:v=>v*0.453592,fb:v=>v/0.453592},{label:'Ounce',tb:v=>v*0.0283495,fb:v=>v/0.0283495},
    {label:'Metric Ton',tb:v=>v*1000,fb:v=>v/1000},
  ]},
  {name:'Temperature',units:[
    {label:'Celsius',tb:v=>v,fb:v=>v},
    {label:'Fahrenheit',tb:v=>(v-32)*5/9,fb:v=>v*9/5+32},
    {label:'Kelvin',tb:v=>v-273.15,fb:v=>v+273.15},
  ]},
  {name:'Area',units:[
    {label:'Sq Meter',tb:v=>v,fb:v=>v},{label:'Sq Km',tb:v=>v*1e6,fb:v=>v/1e6},
    {label:'Sq Mile',tb:v=>v*2589988,fb:v=>v/2589988},{label:'Sq Foot',tb:v=>v*0.092903,fb:v=>v/0.092903},
    {label:'Acre',tb:v=>v*4046.86,fb:v=>v/4046.86},{label:'Hectare',tb:v=>v*10000,fb:v=>v/10000},
  ]},
  {name:'Speed',units:[
    {label:'m/s',tb:v=>v,fb:v=>v},{label:'km/h',tb:v=>v/3.6,fb:v=>v*3.6},
    {label:'mph',tb:v=>v*0.44704,fb:v=>v/0.44704},{label:'knot',tb:v=>v*0.514444,fb:v=>v/0.514444},
  ]},
  {name:'Volume',units:[
    {label:'Liter',tb:v=>v,fb:v=>v},{label:'Milliliter',tb:v=>v/1000,fb:v=>v*1000},
    {label:'Gallon (US)',tb:v=>v*3.78541,fb:v=>v/3.78541},{label:'Fluid Oz',tb:v=>v*0.0295735,fb:v=>v/0.0295735},
    {label:'Cup',tb:v=>v*0.236588,fb:v=>v/0.236588},{label:'Cubic Meter',tb:v=>v*1000,fb:v=>v/1000},
  ]},
]
export default function UnitConverterPage() {
  const [ci,setCi]=useState(0)
  const [fi,setFi]=useState(0)
  const [ti,setTi]=useState(1)
  const [val,setVal]=useState('1')
  const cat=CATS[ci],from=cat.units[fi],to=cat.units[ti]
  const n=parseFloat(val)
  const result=isNaN(n)?'':(() => {
    const r=to.fb(from.tb(n))
    if(!isFinite(r))return 'N/A'
    if(Math.abs(r)<0.0001&&r!==0||Math.abs(r)>1e9)return r.toExponential(6)
    return parseFloat(r.toFixed(8)).toString()
  })()
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c,i)=>(
            <button key={c.name} onClick={()=>{setCi(i);setFi(0);setTi(1)}}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition ${i===ci?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{c.name}</button>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="number" value={val} onChange={e=>setVal(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2 text-lg"/>
            <select value={fi} onChange={e=>setFi(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-2 text-sm">
              {cat.units.map((u,i)=><option key={u.label} value={i}>{u.label}</option>)}
            </select>
          </div>
          <div className="text-center text-gray-400 text-2xl">&#8597;</div>
          <div className="flex gap-2">
            <input readOnly value={result} className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-lg font-mono text-blue-700"/>
            <select value={ti} onChange={e=>setTi(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-2 text-sm">
              {cat.units.map((u,i)=><option key={u.label} value={i}>{u.label}</option>)}
            </select>
          </div>
        </div>
        {result&&<div className="bg-blue-50 rounded-lg p-3 text-sm text-center text-blue-800">
          <strong>{val} {from.label}</strong> = <strong>{result} {to.label}</strong>
        </div>}
      </div>
    </ToolLayout>
  )
}