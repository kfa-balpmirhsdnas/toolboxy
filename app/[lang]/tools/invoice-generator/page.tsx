'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

interface Item{desc:string;qty:string;price:string}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='invoice-generator')
  const [from,setFrom]=useState('Your Company')
  const [to,setTo]=useState('Client Name')
  const [invNum,setInvNum]=useState('INV-001')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [items,setItems]=useState<Item[]>([{desc:'Service',qty:'1',price:'100'}])
  const [tax,setTax]=useState('0')

  function addItem(){setItems(p=>[...p,{desc:'',qty:'1',price:'0'}])}
  function updateItem(i:number,k:keyof Item,v:string){
    setItems(p=>p.map((it,idx)=>idx===i?{...it,[k]:v}:it))
  }
  function removeItem(i:number){setItems(p=>p.filter((_,idx)=>idx!==i))}

  const subtotal=items.reduce((s,it)=>s+(parseFloat(it.qty)||0)*(parseFloat(it.price)||0),0)
  const taxAmt=subtotal*(parseFloat(tax)||0)/100
  const total=subtotal+taxAmt

  function print(){window.print()}

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input value={from} onChange={e=>setFrom(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input value={to} onChange={e=>setTo(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Invoice #</label>
            <input value={invNum} onChange={e=>setInvNum(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
        </div>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Amount</th>
                <th className="px-2"/>
              </tr>
            </thead>
            <tbody>
              {items.map((it,i)=>(
                <tr key={i} className="border-t">
                  <td className="px-3 py-1">
                    <input value={it.desc} onChange={e=>updateItem(i,'desc',e.target.value)}
                      className="w-full border-none outline-none"/>
                  </td>
                  <td className="px-3 py-1">
                    <input type="number" value={it.qty} onChange={e=>updateItem(i,'qty',e.target.value)}
                      className="w-16 text-right border-none outline-none"/>
                  </td>
                  <td className="px-3 py-1">
                    <input type="number" value={it.price} onChange={e=>updateItem(i,'price',e.target.value)}
                      className="w-20 text-right border-none outline-none"/>
                  </td>
                  <td className="px-3 py-1 text-right">${((parseFloat(it.qty)||0)*(parseFloat(it.price)||0)).toFixed(2)}</td>
                  <td className="px-2"><button onClick={()=>removeItem(i)} className="text-red-400">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
        <div className="flex justify-end">
          <div className="space-y-1 text-sm w-48">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span>Tax (%)</span>
              <input type="number" value={tax} onChange={e=>setTax(e.target.value)}
                className="w-16 border rounded px-2 py-0.5 text-right"/>
            </div>
            <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
        <button onClick={print}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Print / Save PDF
        </button>
      </div>
    </ToolLayout>
  )
}
