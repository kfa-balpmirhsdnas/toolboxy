'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('fuel-economy-calculator')!

export default function FuelEconomyCalculatorPage() {
  const [distance,setDistance]=useState('')
  const [distUnit,setDistUnit]=useState<'km'|'mi'>('km')
  const [fuelUsed,setFuelUsed]=useState('')
  const [fuelUnit,setFuelUnit]=useState<'L'|'gal'>('L')
  const [fuelPrice,setFuelPrice]=useState('')
  const [priceUnit,setPriceUnit]=useState<'L'|'gal'>('L')

  const d=parseFloat(distance),f=parseFloat(fuelUsed),p=parseFloat(fuelPrice)
  const valid=d>0&&f>0

  const distKm=distUnit==='km'?d:d*1.60934
  const fuelL=fuelUnit==='L'?f:f*3.78541

  const l100km=fuelL/distKm*100
  const mpg=distKm/1.60934/(fuelL/3.78541)
  const kml=distKm/fuelL

  const pricePer100km=p&&p>0?
    (priceUnit==='L'?p:p/3.78541)*l100km
    :null

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fuel Economy Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate fuel efficiency in L/100km, MPG, and km/L with trip cost estimation</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
            <div className="flex gap-2">
              <input type="number" value={distance} onChange={e=>setDistance(e.target.value)} placeholder="e.g. 100"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {(['km','mi'] as const).map(u=>(
                <button key={u} onClick={()=>setDistUnit(u)} className={'px-3 py-2 rounded-lg font-medium transition-colors '+(distUnit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Used</label>
            <div className="flex gap-2">
              <input type="number" value={fuelUsed} onChange={e=>setFuelUsed(e.target.value)} placeholder="e.g. 7.5"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {(['L','gal'] as const).map(u=>(
                <button key={u} onClick={()=>setFuelUnit(u)} className={'px-3 py-2 rounded-lg font-medium transition-colors '+(fuelUnit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Price (optional)</label>
            <div className="flex gap-2">
              <input type="number" value={fuelPrice} onChange={e=>setFuelPrice(e.target.value)} placeholder="e.g. 1.65"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {(['L','gal'] as const).map(u=>(
                <button key={u} onClick={()=>setPriceUnit(u)} className={'px-3 py-2 rounded-lg font-medium transition-colors '+(priceUnit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>per {u}</button>
              ))}
            </div>
          </div>
        </div>
        {valid&&(
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[['L/100km',l100km.toFixed(2)],['MPG',mpg.toFixed(2)],['km/L',kml.toFixed(2)]].map(([l,v])=>(
              <div key={l} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-brand-600">{v}</div>
                <div className="text-xs text-gray-500 mt-1">{l}</div>
              </div>
            ))}
            {pricePer100km!==null&&(
              <div className="col-span-3 bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-brand-700">{pricePer100km.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Cost per 100 km</div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}