'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('scientific-calculator')!
export default function ScientificCalculatorPage() {
  const [expr,setExpr]=useState('')
  const [result,setResult]=useState('')
  const [history,setHistory]=useState<{expr:string;result:string}[]>([])
  const [deg,setDeg]=useState(true)
  const toRad=(v:number)=>deg?v*Math.PI/180:v
  const calc=()=>{
    try{
      let e=expr.replace(/sin(/g,'Math.sin(toRad(').replace(/cos(/g,'Math.cos(toRad(').replace(/tan(/g,'Math.tan(toRad(')
      e=e.replace(/√(/g,'Math.sqrt(').replace(/log(/g,'Math.log10(').replace(/ln(/g,'Math.log(')
      e=e.replace(/π/g,'Math.PI').replace(/e(?![a-zA-Z])/g,'Math.E').replace(/^/g,'**')
      let opens=(e.match(/toRad(/g)||[]).length
      e+=')'.repeat(opens)
      const r=Function('toRad','"use strict"; return ('+e+')')(toRad)
      const rs=typeof r==='number'?parseFloat(r.toFixed(10)).toString():'Error'
      setResult(rs)
      setHistory(h=>[{expr,result:rs},...h].slice(0,10))
    }catch{setResult('Error')}
  }
  const append=(v:string)=>setExpr(e=>e+v)
  const BTN_ROWS=[
    [{l:'7',v:'7'},{l:'8',v:'8'},{l:'9',v:'9'},{l:'÷',v:'/'},{l:'sin(',v:'sin('},{l:'cos(',v:'cos('}],
    [{l:'4',v:'4'},{l:'5',v:'5'},{l:'6',v:'6'},{l:'×',v:'*'},{l:'tan(',v:'tan('},{l:'√(',v:'√('}],
    [{l:'1',v:'1'},{l:'2',v:'2'},{l:'3',v:'3'},{l:'-',v:'-'},{l:'log(',v:'log('},{l:'ln(',v:'ln('}],
    [{l:'0',v:'0'},{l:'.',v:'.'},{l:'(',v:'('},{l:')',v:')'},{l:'+',v:'+'},{l:'^',v:'^'}],
    [{l:'π',v:'π'},{l:'e',v:'e'},{l:'±',v:''},{l:'C',v:''},{l:'⌫',v:''},{l:'=',v:'='}],
  ]
  const handleBtn=(l:string,v:string)=>{
    if(l==='='){calc();return}
    if(l==='C'){setExpr('');setResult('');return}
    if(l==='⌫'){setExpr(e=>e.slice(0,-1));return}
    if(l==='±'){setExpr(e=>e.startsWith('-')?e.slice(1):'-'+e);return}
    append(v)
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4">
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <div className="flex justify-end gap-2 mb-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={deg} onChange={e=>setDeg(e.target.checked)} className="rounded"/>
              <span className="text-xs text-gray-400">{deg?'DEG':'RAD'}</span>
            </label>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-3 text-right min-h-16">
            <p className="text-gray-400 text-sm font-mono truncate">{expr||'0'}</p>
            <p className="text-white text-2xl font-bold font-mono">{result}</p>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {BTN_ROWS.flat().map((btn,i)=>(
              <button key={i} onClick={()=>handleBtn(btn.l,btn.v)}
                className={`py-3 rounded-xl text-sm font-medium transition ${btn.l==='='?'bg-blue-600 text-white col-span-1 hover:bg-blue-500':btn.l==='C'?'bg-red-500 text-white hover:bg-red-400':['÷','×','-','+','^'].includes(btn.l)?'bg-amber-500 text-white hover:bg-amber-400':['sin(','cos(','tan(','√(','log(','ln(','π','e'].includes(btn.l)?'bg-gray-600 text-gray-100 hover:bg-gray-500 text-xs':'bg-gray-700 text-gray-100 hover:bg-gray-600'}`}>
                {btn.l}
              </button>
            ))}
          </div>
        </div>
        {history.length>0&&(
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">History</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((h,i)=>(
                <div key={i} className="flex justify-between text-xs px-3 py-1.5 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" onClick={()=>setExpr(h.result)}>
                  <span className="text-gray-500 font-mono">{h.expr}</span>
                  <span className="text-gray-800 font-semibold font-mono">{h.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}