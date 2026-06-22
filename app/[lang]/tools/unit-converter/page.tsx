'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

type Category='length'|'weight'|'volume'|'area'

const CATS:{id:Category;label:string;units:{id:string;label:string;factor:number}[]}[]=[
  {id:'length',label:'Length',units:[
    {id:'mm',label:'Millimeter (mm)',factor:0.001},{id:'cm',label:'Centimeter (cm)',factor:0.01},
    {id:'m',label:'Meter (m)',factor:1},{id:'km',label:'Kilometer (km)',factor:1000},
    {id:'in',label:'Inch (in)',factor:0.0254},{id:'ft',label:'Foot (ft)',factor:0.3048},
    {id:'yd',label:'Yard (yd)',factor:0.9144},{id:'mi',label:'Mile (mi)',factor:1609.344},
    {id:'nm',label:'Nautical mile',factor:1852},{id:'ly',label:'Light year',factor:9.461e15},
  ]},
  {id:'weight',label:'Weight',units:[
    {id:'mg',label:'Milligram (mg)',factor:0.000001},{id:'g',label:'Gram (g)',factor:0.001},
    {id:'kg',label:'Kilogram (kg)',factor:1},{id:'t',label:'Metric ton',factor:1000},
    {id:'oz',label:'Ounce (oz)',factor:0.0283495},{id:'lb',label:'Pound (lb)',factor:0.453592},
    {id:'st',label:'Stone (st)',factor:6.35029},{id:'ton',label:'US ton',factor:907.185},
  ]},
  {id:'volume',label:'Volume',units:[
    {id:'ml',label:'Milliliter (ml)',factor:0.001},{id:'l',label:'Liter (L)',factor:1},
    {id:'m3',label:'Cubic meter (m\u00B3)',factor:1000},{id:'cm3',label:'Cubic cm (cm\u00B3)',factor:0.001},
    {id:'floz',label:'US fl oz',factor:0.0295735},{id:'cup',label:'US cup',factor:0.236588},
    {id:'pt',label:'US pint',factor:0.473176},{id:'qt',label:'US quart',factor:0.946353},
    {id:'gal',label:'US gallon',factor:3.78541},{id:'tsp',label:'Teaspoon',factor:0.00492892},
    {id:'tbsp',label:'Tablespoon',factor:0.0147868},
  ]},
  {id:'area',label:'Area',units:[
    {id:'mm2',label:'mm\u00B2',factor:0.000001},{id:'cm2',label:'cm\u00B2',factor:0.0001},
    {id:'m2',label:'m\u00B2',factor:1},{id:'km2',label:'km\u00B2',factor:1000000},
    {id:'ha',label:'Hectare',factor:10000},{id:'ac',label:'Acre',factor:4046.86},
    {id:'ft2',label:'ft\u00B2',factor:0.092903},{id:'mi2',label:'mi\u00B2',factor:2589988},
  ]},
]


const tool = getToolBySlug('unit-converter')!

export default function UnitConverterPage() {
  const [cat,setCat]=useState<Category>('length')
  const [val,setVal]=useState('1')
  const [from,setFrom]=useState('m')

  const catData=CATS.find(c=>c.id===cat)!
  const fromUnit=catData.units.find(u=>u.id===from)
  const base=(parseFloat(val)||0)*(fromUnit?.factor??1)

  function switchCat(c:Category){setCat(c);setFrom(CATS.find(x=>x.id===c)!.units[2].id)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Unit Converter</h1>
        <p className="text-gray-500 mb-8">Convert length, weight, volume, and area units in one place</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>switchCat(c.id)} className={'px-4 py-2 rounded-lg font-medium transition-colors '+(cat===c.id?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{c.label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="number" value={val} onChange={e=>setVal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select value={from} onChange={e=>setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 h-[46px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                {catData.units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {catData.units.map(u=>{
            const v=base/u.factor
            const fmt=v===0?'0':Math.abs(v)>=0.0001&&Math.abs(v)<1e13?parseFloat(v.toPrecision(7)).toLocaleString('en-US',{maximumSignificantDigits:7}):v.toExponential(4)
            return(
              <div key={u.id} onClick={()=>setFrom(u.id)} className={'flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-colors '+(u.id===from?'border-brand-300 bg-brand-50':'bg-white border-gray-200 hover:border-gray-300')}>
                <span className="text-sm font-medium text-gray-600">{u.label}</span>
                <span className="font-mono text-sm font-semibold text-gray-900">{fmt}</span>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}