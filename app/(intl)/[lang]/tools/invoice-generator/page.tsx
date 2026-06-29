'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import {TOOLS} from '@/lib/tools/registry'

interface Item{desc:string;qty:string;price:string}

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='invoice-generator')
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
            <label className="block text-sm font-medium mb-1">{t('ig_from')}</label>
            <input value={from} onChange={e=>setFrom(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ig_to')}</label>
            <input value={to} onChange={e=>setTo(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ig_invnum')}</label>
            <input value={invNum} onChange={e=>setInvNum(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ig_date')}</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
        </div>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">{t('ig_desc')}</th>
                <th className="text-right px-3 py-2">{t('ig_qty')}</th>
                <th className="text-right px-3 py-2">{t('ig_price')}</th>
                <th className="text-right px-3 py-2">{t('ig_amount')}</th>
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
                  <td className="px-2"><button onClick={()=>removeItem(i)} className="text-red-400 inline-flex items-center justify-center" aria-label="remove"><ToolIcon name="x" className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="text-sm text-blue-600 hover:underline">{t('ig_additem')}</button>
        <div className="flex justify-end">
          <div className="space-y-1 text-sm w-48">
            <div className="flex justify-between"><span>{t('ig_subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span>{t('ig_tax')}</span>
              <input type="number" value={tax} onChange={e=>setTax(e.target.value)}
                className="w-16 border rounded px-2 py-0.5 text-right"/>
            </div>
            <div className="flex justify-between font-bold border-t pt-1"><span>{t('tc_total')}</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
        <button onClick={print}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {t('ig_print')}
        </button>
      </div>
    </ToolLayout>
  )
}
