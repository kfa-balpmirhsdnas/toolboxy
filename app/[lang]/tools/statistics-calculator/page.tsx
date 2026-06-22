'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('statistics-calculator')!
function stats(nums:number[]):{label:string;val:string}[]{
  if(nums.length===0)return []
  const sorted=[...nums].sort((a,b)=>a-b)
  const n=nums.length
  const sum=nums.reduce((a,b)=>a+b,0)
  const mean=sum/n
  const median=n%2===0?(sorted[n/2-1]+sorted[n/2])/2:sorted[Math.floor(n/2)]
  const variance=nums.reduce((a,b)=>a+Math.pow(b-mean,2),0)/n
  const stdDev=Math.sqrt(variance)
  const sampleStd=n>1?Math.sqrt(nums.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(n-1)):0
  const freq:Record<number,number>={};nums.forEach(v=>{freq[v]=(freq[v]||0)+1})
  const maxFreq=Math.max(...Object.values(freq))
  const mode=Object.entries(freq).filter(([,f])=>f===maxFreq).map(([v])=>Number(v))
  const range=sorted[n-1]-sorted[0]
  const q1=sorted[Math.floor(n*0.25)]
  const q3=sorted[Math.floor(n*0.75)]
  const iqr=q3-q1
  return [
    {label:'Count',val:String(n)},
    {label:'Sum',val:parseFloat(sum.toFixed(4)).toString()},
    {label:'Mean (average)',val:parseFloat(mean.toFixed(4)).toString()},
    {label:'Median',val:parseFloat(median.toFixed(4)).toString()},
    {label:'Mode',val:mode.length<=3?mode.join(', '):'Multiple'},
    {label:'Min',val:String(sorted[0])},
    {label:'Max',val:String(sorted[n-1])},
    {label:'Range',val:parseFloat(range.toFixed(4)).toString()},
    {label:'Variance (pop)',val:parseFloat(variance.toFixed(4)).toString()},
    {label:'Std Dev (pop)',val:parseFloat(stdDev.toFixed(4)).toString()},
    {label:'Std Dev (sample)',val:parseFloat(sampleStd.toFixed(4)).toString()},
    {label:'Q1',val:parseFloat(q1.toFixed(4)).toString()},
    {label:'Q3',val:parseFloat(q3.toFixed(4)).toString()},
    {label:'IQR',val:parseFloat(iqr.toFixed(4)).toString()},
  ]
}
export default function StatisticsCalculatorPage() {
  const [input,setInput]=useState('2, 4, 4, 4, 5, 5, 7, 9')
  const nums=input.split(/[,s
]+/).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n))
  const results=stats(nums)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Numbers (comma or space separated)</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} placeholder="e.g. 1, 2, 3, 4, 5" className="w-full rounded border border-gray-300 px-3 py-2 font-mono resize-none"/>
          <p className="text-xs text-gray-400 mt-0.5">{nums.length} numbers detected</p></div>
        {results.length>0&&(
          <div className="grid grid-cols-2 gap-2">
            {results.map(r=>(
              <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500">{r.label}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5 font-mono">{r.val}</p>
              </div>
            ))}
          </div>
        )}
        {nums.length>1&&(
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Distribution (sorted)</p>
            <div className="flex items-end gap-0.5 h-20">
              {[...nums].sort((a,b)=>a-b).map((n,i,arr)=>{
                const min=arr[0],max=arr[arr.length-1],range=max-min||1
                const pct=((n-min)/range)*80+10
                return <div key={i} className="flex-1 bg-blue-400 rounded-t min-w-0.5" style={{height:pct+'%'}} title={String(n)}/>
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}