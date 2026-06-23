'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('invoice-generator')!
type Item={desc:string;qty:number;rate:number}
export default function InvoiceGeneratorPage() {
  const [from,setFrom]=useState('Your Company\nyour@email.com')\n  const [to,setTo]=useState('Client Name
client@email.com')\n  const [invNum,setInvNum]=useState('INV-001')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [due,setDue]=useState(()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().slice(0,10)})
  const [items,setItems]=useState<Item[]>([{desc:'Service',qty:1,rate:100},{desc:'',qty:0,rate:0}])
  const [tax,setTax]=useState(0)
  const [notes,setNotes]=useState('Thank you for your business!')
  const subtotal=items.reduce((a,i)=>a+i.qty*i.rate,0)
  const taxAmt=subtotal*tax/100
  const total=subtotal+taxAmt
  const updItem=(i:number,k:keyof Item,v:string|number)=>setItems(s=>{const n=[...s];(n[i] as Record<string,unknown>)[k]=v;return n})
  const addItem=()=>setItems(s=>[...s,{desc:'',qty:1,rate:0}])
  const delItem=(i:number)=>items.length>1&&setItems(s=>s.filter((_,j)=>j!==i))
  const fmt=(n:number)=>'$'+n.toFixed(2)
  const print=()=>window.print()
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5 print:px-0">
        <div className="flex justify-between items-center print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Builder</h2>
          <button onClick={print} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Print / Save PDF</button>
        </div>
        <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6 print:border-0">
          <div className="flex justify-between items-start">
            <div className="flex-1"><p className="text-xs text-gray-400 mb-1 print:hidden">From</p>
              <textarea value={from} onChange={e=>setFrom(e.target.value)} rows={3} className="w-full font-medium text-gray-800 resize-none border-0 focus:outline-none print:pointer-events-none" style={{background:'transparent'}}/></div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 mb-2">INVOICE</p>
              <p className="text-sm text-gray-600">No: <input value={invNum} onChange={e=>setInvNum(e.target.value)} className="font-medium w-24 text-right border-b border-dashed focus:outline-none print:border-0"/></p>
              <p className="text-sm text-gray-600">Date: <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border-b border-dashed focus:outline-none print:border-0"/></p>
              <p className="text-sm text-gray-600">Due: <input type="date" value={due} onChange={e=>setDue(e.target.value)} className="border-b border-dashed focus:outline-none print:border-0"/></p>
            </div>
          </div>
          <div><p className="text-xs text-gray-400 mb-1">Bill To</p>
            <textarea value={to} onChange={e=>setTo(e.target.value)} rows={3} className="w-full font-medium text-gray-800 resize-none border-0 focus:outline-none bg-blue-50 rounded-lg px-3 py-2 print:bg-transparent" style={{background:undefined}}/></div>
          <table className="w-full">
            <thead><tr className="border-b-2 border-gray-800"><th className="text-left py-2 text-sm">Description</th><th className="text-right py-2 text-sm w-16">Qty</th><th className="text-right py-2 text-sm w-24">Rate</th><th className="text-right py-2 text-sm w-24">Amount</th></tr></thead>
            <tbody>
              {items.map((item,i)=>(
                <tr key={i} className="border-b border-gray-100 group">
                  <td className="py-1.5"><input value={item.desc} onChange={e=>updItem(i,'desc',e.target.value)} placeholder="Item description" className="w-full text-sm focus:outline-none"/></td>
                  <td><input type="number" value={item.qty||''} onChange={e=>updItem(i,'qty',Number(e.target.value))} className="w-full text-right text-sm focus:outline-none" min="0"/></td>
                  <td><input type="number" value={item.rate||''} onChange={e=>updItem(i,'rate',Number(e.target.value))} className="w-full text-right text-sm focus:outline-none" min="0"/></td>
                  <td className="text-right text-sm font-medium py-1.5">{item.qty&&item.rate?fmt(item.qty*item.rate):''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="text-xs text-blue-600 hover:underline print:hidden">+ Add item</button>
          <div className="flex justify-end">
            <div className="w-56 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Tax</span>
                <div className="flex items-center gap-1"><input type="number" value={tax} onChange={e=>setTax(Number(e.target.value))} className="w-12 text-right border-b border-dashed focus:outline-none text-sm print:hidden" min="0" max="100"/><span>%</span><span className="font-medium ml-2">{fmt(taxAmt)}</span></div></div>
              <div className="flex justify-between border-t-2 border-gray-800 pt-1 font-bold text-base"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
          {notes&&<div className="text-sm text-gray-500 border-t border-gray-100 pt-3"><p className="font-medium text-gray-700 mb-1">Notes</p><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} className="w-full resize-none focus:outline-none text-sm text-gray-600" style={{background:'transparent'}}/></div>}
        </div>
      </div>
    </ToolLayout>
  )
}