'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('unit-converter')!
type Category={name:string;units:{id:string;label:string;toBase:number}[]}
const CATEGORIES:Category[]=[
  {name:'Length',units:[{id:'mm',label:'mm',toBase:0.001},{id:'cm',label:'cm',toBase:0.01},{id:'m',label:'m',toBase:1},{id:'km',label:'km',toBase:1000},{id:'in',label:'inch',toBase:0.0254},{id:'ft',label:'foot',toBase:0.3048},{id:'yd',label:'yard',toBase:0.9144},{id:'mi',label:'mile',toBase:1609.34}]},
  {name:'Weight',units:[{id:'mg',label:'mg',toBase:0.000001},{id:'g',label:'g',toBase:0.001},{id:'kg',label:'kg',toBase:1},{id:'t',label:'tonne',toBase:1000},{id:'oz',label:'oz',toBase:0.0283495},{id:'lb',label:'lb',toBase:0.453592},{id:'st',label:'stone',toBase:6.35029}]},
  {name:'Temperature',units:[{id:'c',label:'°C',toBase:1},{id:'f',label:'°F',toBase:1},{id:'k',label:'K',toBase:1}]},
  {name:'Area',units:[{id:'mm2',label:'mm²',toBase:0.000001},{id:'cm2',label:'cm²',toBase:0.0001},{id:'m2',label:'m²',toBase:1},{id:'km2',label:'km²',toBase:1000000},{id:'ha',label:'ha',toBase:10000},{id:'ac',label:'acre',toBase:4046.86},{id:'ft2',label:'ft²',toBase:0.092903},{id:'mi2',label:'mi²',toBase:2589988}]},
  {name:'Volume',units:[{id:'ml',label:'mL',toBase:0.001},{id:'l',label:'L',toBase:1},{id:'m3',label:'m³',toBase:1000},{id:'floz',label:'fl oz',toBase:0.0295735},{id:'cup',label:'cup',toBase:0.236588},{id:'pt',label:'pint',toBase:0.473176},{id:'qt',label:'quart',toBase:0.946353},{id:'gal',label:'gallon',toBase:3.78541}]},
  {name:'Speed',units:[{id:'ms',label:'m/s',toBase:1},{id:'kmh',label:'km/h',toBase:0.277778},{id:'mph',label:'mph',toBase:0.44704},{id:'knot',label:'knot',toBase:0.514444},{id:'mach',label:'Mach',toBase:340.29}]},
  {name:'Data',units:[{id:'b',label:'B',toBase:1},{id:'kb',label:'KB',toBase:1024},{id:'mb',label:'MB',toBase:1048576},{id:'gb',label:'GB',toBase:1073741824},{id:'tb',label:'TB',toBase:1099511627776}]},
]
function convertTemp(v:number,from:string,to:string):number{
  let c=from==='f'?(v-32)*5/9:from==='k'?v-273.15:v
  return to==='f'?c*9/5+32:to==='k'?c+273.15:c
}
export default function UnitConverterPage() {
  const [catIdx,setCatIdx]=useState(0)
  const cat=CATEGORIES[catIdx]
  const [fromU,setFromU]=useState(cat.units[0].id)
  const [toU,setToU]=useState(cat.units[2].id)
  const [val,setVal]=useState('1')
  const switchCat=(i:number)=>{setCatIdx(i);setFromU(CATEGORIES[i].units[0].id);setToU(CATEGORIES[i].units[2]?.id||CATEGORIES[i].units[1].id);setVal('1')}
  const compute=():string=>{
    const v=parseFloat(val);if(isNaN(v))return ''
    if(cat.name==='Temperature')return parseFloat(convertTemp(v,fromU,toU).toFixed(6)).toString()
    const fu=cat.units.find(u=>u.id===fromU)!,tu=cat.units.find(u=>u.id===toU)!
    return parseFloat((v*fu.toBase/tu.toBase).toFixed(8)).toString()
  }
  const result=compute()
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c,i)=>(
            <button key={c.name} onClick={()=>switchCat(i)}
              className={'px-3 py-1.5 rounded-full border text-xs font-medium transition '+(catIdx===i?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{c.name}</button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">From</label>
              <div className="flex gap-2">
                <input type="number" value={val} onChange={e=>setVal(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2.5 font-mono text-xl"/>
                <select value={fromU} onChange={e=>setFromU(e.target.value)} className="rounded border border-gray-300 px-2 py-2 text-sm">
                  {cat.units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={()=>{setFromU(toU);setToU(fromU)}} className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Swap</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">To</label>
              <div className="flex gap-2">
                <div className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xl text-blue-700 min-h-11">{result}</div>
                <select value={toU} onChange={e=>setToU(e.target.value)} className="rounded border border-gray-300 px-2 py-2 text-sm">
                  {cat.units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">All conversions from {parseFloat(val)||1} {cat.units.find(u=>u.id===fromU)?.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.units.filter(u=>u.id!==fromU).map(u=>{
              const v=parseFloat(val)||1
              let res:string
              if(cat.name==='Temperature')res=parseFloat(convertTemp(v,fromU,u.id).toFixed(4)).toString()
              else{const fu=cat.units.find(x=>x.id===fromU)!;res=parseFloat((v*fu.toBase/u.toBase).toFixed(4)).toString()}
              return <div key={u.id} className="flex justify-between bg-gray-50 rounded px-2.5 py-1.5 text-sm">
                <span className="text-gray-500">{u.label}</span>
                <span className="font-mono text-gray-800">{res}</span>
              </div>
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}