'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('matrix-calculator')!
type Matrix=number[][]
function makeMatrix(r:number,c:number):Matrix{return Array.from({length:r},()=>Array(c).fill(0))}
function add(a:Matrix,b:Matrix):Matrix{return a.map((row,i)=>row.map((v,j)=>v+b[i][j]))}
function sub(a:Matrix,b:Matrix):Matrix{return a.map((row,i)=>row.map((v,j)=>v-b[i][j]))}
function mul(a:Matrix,b:Matrix):Matrix{
  const r=a.length,c=b[0].length,k=b.length
  return Array.from({length:r},(_,i)=>Array.from({length:c},(_,j)=>Array.from({length:k},(_,l)=>a[i][l]*b[l][j]).reduce((s,v)=>s+v,0)))
}
function transpose(a:Matrix):Matrix{return a[0].map((_,i)=>a.map(r=>r[i]))}
function det2(a:Matrix):number{return a[0][0]*a[1][1]-a[0][1]*a[1][0]}
export default function MatrixCalculatorPage() {
  const t = useTranslations('toolui')
  const [rA,setRA]=useState(2),[cA,setCA]=useState(2)
  const [rB,setRB]=useState(2),[cB,setCB]=useState(2)
  const [mA,setMA]=useState<Matrix>(makeMatrix(2,2))
  const [mB,setMB]=useState<Matrix>(makeMatrix(2,2))
  const [result,setResult]=useState<Matrix|null>(null)
  const [err,setErr]=useState('')
  const setCell=(m:Matrix,setM:(v:Matrix)=>void,r:number,c:number,v:string)=>{const n=[...m.map(row=>[...row])];n[r][c]=parseFloat(v)||0;setM(n)}
  const resizeA=(nr:number,nc:number)=>{setRA(nr);setCA(nc);setMA(makeMatrix(nr,nc));setResult(null)}
  const resizeB=(nr:number,nc:number)=>{setRB(nr);setCB(nc);setMB(makeMatrix(nr,nc));setResult(null)}
  const doOp=(op:string)=>{
    setErr('')
    try{
      if(op==='add'||op==='sub'){if(rA!==rB||cA!==cB)throw new Error(t('mtx_err_dim'));setResult(op==='add'?add(mA,mB):sub(mA,mB))}
      else if(op==='mul'){if(cA!==rB)throw new Error(t('mtx_err_cols'));setResult(mul(mA,mB))}
      else if(op==='transA'){setResult(transpose(mA))}
      else if(op==='transB'){setResult(transpose(mB))}
      else if(op==='detA'){if(rA!==2||cA!==2)throw new Error(t('mtx_err_2x2'));setResult([[det2(mA)]])}
    }catch(e){setErr((e as Error).message);setResult(null)}
  }
  const MGrid=({m,setM,label}:{m:Matrix;setM:(v:Matrix)=>void;label:string})=>(
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${m[0]?.length||1},1fr)`,gap:'4px'}}>
        {m.map((row,ri)=>row.map((v,ci)=>(
          <input key={ri+'-'+ci} type="number" value={v||''} onChange={e=>setCell(m,setM,ri,ci,e.target.value)}
            className="w-14 rounded border border-gray-300 px-2 py-1.5 text-center font-mono text-sm"/>
        )))}
      </div>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex gap-2 items-center text-xs text-gray-500">
              <span>{t('mtt_rows')}:</span>
              <select value={rA} onChange={e=>resizeA(Number(e.target.value),cA)} className="rounded border border-gray-200 px-1 py-0.5">{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select>
              <span>{t('mtt_cols')}:</span>
              <select value={cA} onChange={e=>resizeA(rA,Number(e.target.value))} className="rounded border border-gray-200 px-1 py-0.5">{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select>
            </div>
            <MGrid m={mA} setM={setMA} label={t('mtx_a')}/>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-center text-xs text-gray-500">
              <span>{t('mtt_rows')}:</span>
              <select value={rB} onChange={e=>resizeB(Number(e.target.value),cB)} className="rounded border border-gray-200 px-1 py-0.5">{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select>
              <span>{t('mtt_cols')}:</span>
              <select value={cB} onChange={e=>resizeB(rB,Number(e.target.value))} className="rounded border border-gray-200 px-1 py-0.5">{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select>
            </div>
            <MGrid m={mB} setM={setMB} label={t('mtx_b')}/>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[['add','mtx_op_add'],['sub','mtx_op_sub'],['mul','mtx_op_mul'],['transA','mtx_op_transA'],['transB','mtx_op_transB'],['detA','mtx_op_detA']].map(([op,label])=>(
            <button key={op} onClick={()=>doOp(op)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">{t(label)}</button>
          ))}
        </div>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        {result&&(
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t('mtx_result',{r:result.length,c:result[0].length})}</p>
            <div className="inline-block" style={{display:'grid',gridTemplateColumns:`repeat(${result[0]?.length||1},1fr)`,gap:'4px'}}>
              {result.map((row,ri)=>row.map((v,ci)=>(
                <div key={ri+'-'+ci} className="w-16 rounded bg-blue-50 border border-blue-200 px-2 py-1.5 text-center font-mono text-sm text-blue-800">{parseFloat(v.toFixed(6))}</div>
              )))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}