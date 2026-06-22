'use client'
import { useState } from 'react'

type Item={id:number;name:string;amount:string;category:string;type:'income'|'expense'}

const CATS_INCOME=['Salary','Freelance','Investment','Other']
const CATS_EXPENSE=['Housing','Food','Transport','Entertainment','Health','Education','Savings','Other']

let _id=1

export default function BudgetCalculatorPage() {
  const [items,setItems]=useState<Item[]>([
    {id:_id++,name:'Salary',amount:'5000',category:'Salary',type:'income'},
    {id:_id++,name:'Rent',amount:'1500',category:'Housing',type:'expense'},
    {id:_id++,name:'Groceries',amount:'400',category:'Food',type:'expense'},
    {id:_id++,name:'Transport',amount:'150',category:'Transport',type:'expense'},
  ])
  const [newName,setNewName]=useState('')
  const [newAmt,setNewAmt]=useState('')
  const [newCat,setNewCat]=useState('Other')
  const [newType,setNewType]=useState<'income'|'expense'>('expense')

  const income=items.filter(i=>i.type==='income').reduce((s,i)=>s+(parseFloat(i.amount)||0),0)
  const expense=items.filter(i=>i.type==='expense').reduce((s,i)=>s+(parseFloat(i.amount)||0),0)
  const balance=income-expense
  const fmt=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD'})

  // Group expenses by category
  const expBycat=items.filter(i=>i.type==='expense').reduce((acc,i)=>{
    const cat=i.category;const amt=parseFloat(i.amount)||0
    acc[cat]=(acc[cat]||0)+amt;return acc
  },{} as Record<string,number>)

  function addItem(){
    if(!newName||!newAmt) return
    setItems(prev=>[...prev,{id:_id++,name:newName,amount:newAmt,category:newCat,type:newType}])
    setNewName('');setNewAmt('')
  }
  function remove(id:number){setItems(prev=>prev.filter(i=>i.id!==id))}
  function update(id:number,f:keyof Item,v:string){setItems(prev=>prev.map(i=>i.id===id?{...i,[f]:v}:i))}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Calculator</h1>
        <p className="text-gray-500 mb-6">Track income and expenses to see your monthly budget balance</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['Total Income',income,'text-green-600','bg-green-50'],['Total Expenses',expense,'text-red-500','bg-red-50'],['Balance',balance,balance>=0?'text-blue-600':'text-red-600',balance>=0?'bg-blue-50':'bg-red-50']].map(([l,v,tc,bg])=>(
            <div key={l as string} className={'rounded-xl border border-gray-200 p-4 text-center '+(bg as string)}>
              <div className={'text-xl font-bold '+(tc as string)}>{fmt(v as number)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l as string}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Income</h2>
          {items.filter(i=>i.type==='income').map(i=>(
            <div key={i.id} className="flex gap-2 items-center mb-2">
              <input value={i.name} onChange={e=>update(i.id,'name',e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              <select value={i.category} onChange={e=>update(i.id,'category',e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                {CATS_INCOME.map(c=><option key={c}>{c}</option>)}
              </select>
              <input type="number" value={i.amount} onChange={e=>update(i.id,'amount',e.target.value)} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono text-right focus:outline-none" />
              <button onClick={()=>remove(i.id)} className="text-gray-300 hover:text-red-400">\u00D7</button>
            </div>
          ))}
          <h2 className="font-semibold text-gray-800 mt-4 mb-3">Expenses</h2>
          {items.filter(i=>i.type==='expense').map(i=>(
            <div key={i.id} className="flex gap-2 items-center mb-2">
              <input value={i.name} onChange={e=>update(i.id,'name',e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              <select value={i.category} onChange={e=>update(i.id,'category',e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                {CATS_EXPENSE.map(c=><option key={c}>{c}</option>)}
              </select>
              <input type="number" value={i.amount} onChange={e=>update(i.id,'amount',e.target.value)} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono text-right focus:outline-none" />
              <button onClick={()=>remove(i.id)} className="text-gray-300 hover:text-red-400">\u00D7</button>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-4 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Add New Item</p>
            <div className="flex gap-2">
              <select value={newType} onChange={e=>setNewType(e.target.value as 'income'|'expense')} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                <option value="income">Income</option><option value="expense">Expense</option>
              </select>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                {(newType==='income'?CATS_INCOME:CATS_EXPENSE).map(c=><option key={c}>{c}</option>)}
              </select>
              <input type="number" value={newAmt} onChange={e=>setNewAmt(e.target.value)} placeholder="0" className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono text-right focus:outline-none" />
              <button onClick={addItem} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm">+</button>
            </div>
          </div>
        </div>
        {Object.keys(expBycat).length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Expense Breakdown</h2>
            {Object.entries(expBycat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
              <div key={cat} className="mb-2">
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-gray-700">{cat}</span>
                  <span className="font-medium">{fmt(amt)} <span className="text-gray-400 text-xs">({expense>0?(amt/expense*100).toFixed(0):0}%)</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div style={{width:(expense>0?amt/expense*100:0)+'%'}} className="h-2 bg-brand-400 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}