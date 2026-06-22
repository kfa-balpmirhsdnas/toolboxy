'use client'
import { useState } from 'react'

type Assignment={id:number;name:string;score:string;maxScore:string;weight:string}

function letterGrade(pct:number):string{
  if(pct>=97) return 'A+'
  if(pct>=93) return 'A'
  if(pct>=90) return 'A-'
  if(pct>=87) return 'B+'
  if(pct>=83) return 'B'
  if(pct>=80) return 'B-'
  if(pct>=77) return 'C+'
  if(pct>=73) return 'C'
  if(pct>=70) return 'C-'
  if(pct>=67) return 'D+'
  if(pct>=63) return 'D'
  if(pct>=60) return 'D-'
  return 'F'
}

function gradeColor(l:string):string{
  if(l.startsWith('A')) return 'text-green-600'
  if(l.startsWith('B')) return 'text-blue-600'
  if(l.startsWith('C')) return 'text-yellow-600'
  if(l.startsWith('D')) return 'text-orange-600'
  return 'text-red-600'
}

export default function GradeCalculatorPage() {
  const [mode,setMode]=useState<'simple'|'weighted'>('simple')
  const [items,setItems]=useState<Assignment[]>([{id:1,name:'Midterm',score:'85',maxScore:'100',weight:'30'},{id:2,name:'Final',score:'90',maxScore:'100',weight:'40'},{id:3,name:'Homework',score:'47',maxScore:'50',weight:'30'}])
  const [nextId,setNextId]=useState(4)

  function add(){setItems(i=>[...i,{id:nextId,name:'',score:'',maxScore:'100',weight:'10'}]);setNextId(n=>n+1)}
  function remove(id:number){setItems(i=>i.filter(x=>x.id!==id))}
  function update(id:number,f:keyof Assignment,v:string){setItems(i=>i.map(x=>x.id===id?{...x,[f]:v}:x))}

  let finalPct=0
  if(mode==='simple'){
    const valid=items.filter(i=>i.score!==''&&i.maxScore!==''&&parseFloat(i.maxScore)>0)
    const total=valid.reduce((s,i)=>s+parseFloat(i.maxScore),0)
    const scored=valid.reduce((s,i)=>s+parseFloat(i.score),0)
    finalPct=total>0?scored/total*100:0
  }else{
    const totalW=items.reduce((s,i)=>s+(parseFloat(i.weight)||0),0)
    finalPct=totalW>0?items.reduce((s,i)=>{
      const p=parseFloat(i.maxScore)>0?(parseFloat(i.score)||0)/parseFloat(i.maxScore)*100:0
      return s+(parseFloat(i.weight)||0)/totalW*p
    },0):0
  }

  const letter=letterGrade(finalPct)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your overall grade from multiple assignments with optional weighting</p>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('simple')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='simple'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>Simple Average</button>
          <button onClick={()=>setMode('weighted')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='weighted'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>Weighted</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className={'grid gap-2 text-xs font-medium text-gray-500 px-1 '+(mode==='weighted'?'grid-cols-[1fr_auto_auto_auto_auto]':'grid-cols-[1fr_auto_auto_auto]')}>
            <span>Assignment</span><span>Score</span><span>Max</span>{mode==='weighted'&&<span>Weight %</span>}<span/>
          </div>
          {items.map(item=>(
            <div key={item.id} className={'grid gap-2 items-center '+(mode==='weighted'?'grid-cols-[1fr_auto_auto_auto_auto]':'grid-cols-[1fr_auto_auto_auto]')}>
              <input value={item.name} onChange={e=>update(item.id,'name',e.target.value)} placeholder="Assignment name"
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="number" value={item.score} onChange={e=>update(item.id,'score',e.target.value)} placeholder="85"
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="number" value={item.maxScore} onChange={e=>update(item.id,'maxScore',e.target.value)}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {mode==='weighted'&&<input type="number" value={item.weight} onChange={e=>update(item.id,'weight',e.target.value)} placeholder="%"
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />}
              <button onClick={()=>remove(item.id)} className="text-gray-400 hover:text-red-500">\u00D7</button>
            </div>
          ))}
          <button onClick={add} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">+ Add Assignment</button>
        </div>
        {finalPct>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Grade</p>
              <p className="text-4xl font-bold text-gray-900">{finalPct.toFixed(1)}%</p>
            </div>
            <div className={gradeColor(letter)+' text-6xl font-black'}>{letter}</div>
          </div>
        )}
      </div>
    </main>
  )
}