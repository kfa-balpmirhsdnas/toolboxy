'use client'
import { useState } from 'react'

export default function DiscountCalculatorPage() {
  const [original,setOriginal]=useState('100')
  const [discount,setDiscount]=useState('20')
  const [final,setFinal]=useState('')

  const origNum=parseFloat(original)||0
  const discNum=parseFloat(discount)||0
  const salePrice=origNum*(1-discNum/100)
  const savings=origNum-salePrice

  // Reverse: find discount % from final price
  const finalNum=parseFloat(final)||0
  const revDisc=origNum>0&&finalNum>0?((origNum-finalNum)/origNum*100):0
  const revSavings=origNum-finalNum

  const PRESETS=[5,10,15,20,25,30,40,50,60,70,75]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate sale prices, savings, and find the discount percentage from two prices</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Price after discount</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input type="number" value={original} onChange={e=>setOriginal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} min={0} max={100}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p=>(
              <button key={p} onClick={()=>setDiscount(String(p))} className={'text-xs px-2.5 py-1 rounded-full font-medium '+(parseFloat(discount)===p?'bg-brand-500 text-white':'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600')}>
                {p}%
              </button>
            ))}
          </div>
          {origNum>0&&discNum>=0&&discNum<=100&&(
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Sale Price</div>
                <div className="text-2xl font-bold text-brand-700">{salePrice.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">You Save</div>
                <div className="text-2xl font-bold text-green-700">{savings.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Find the discount %</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input type="number" value={original} onChange={e=>setOriginal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Price</label>
              <input type="number" value={final} onChange={e=>setFinal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {origNum>0&&finalNum>0&&finalNum<=origNum&&(
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Discount</div>
                <div className="text-2xl font-bold text-purple-700">{revDisc.toFixed(1)}%</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Amount Saved</div>
                <div className="text-2xl font-bold text-orange-700">{revSavings.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}