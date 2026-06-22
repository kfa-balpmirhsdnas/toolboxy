'use client'
import { useState, useMemo } from 'react'

type DiffLine={type:'equal'|'add'|'remove';text:string;lineNum?:number}

function diffLines(a:string,b:string):DiffLine[]{
  const la=a.split('\n'),lb=b.split('\n')
  // Simple LCS-based line diff
  const m=la.length,n=lb.length
  const dp:number[][]=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){
    if(la[i]===lb[j])dp[i][j]=dp[i+1][j+1]+1
    else dp[i][j]=Math.max(dp[i+1][j],dp[i][j+1])
  }
  const result:DiffLine[]=[]
  let i=0,j=0,lineA=1,lineB=1
  while(i<m||j<n){
    if(i<m&&j<n&&la[i]===lb[j]){result.push({type:'equal',text:la[i]});i++;j++}
    else if(j<n&&(i>=m||dp[i+1][j]>=dp[i][j+1])){result.push({type:'add',text:lb[j]});j++}
    else{result.push({type:'remove',text:la[i]});i++}
  }
  return result
}

export default function TextDiffPage() {
  const [textA,setTextA]=useState('The quick brown fox\njumps over the lazy dog\nHello World')
  const [textB,setTextB]=useState('The quick brown fox\nleaps over the lazy cat\nHello World\nNew line here')
  const [ignore,setIgnore]=useState(false)

  const diffs=useMemo(()=>{
    const a=ignore?textA.toLowerCase():textA
    const b=ignore?textB.toLowerCase():textB
    return diffLines(a,b)
  },[textA,textB,ignore])

  const added=diffs.filter(d=>d.type==='add').length
  const removed=diffs.filter(d=>d.type==='remove').length
  const unchanged=diffs.filter(d=>d.type==='equal').length

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Diff</h1>
        <p className="text-gray-500 mb-6">Compare two texts side-by-side and see what changed</p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {[['Original (A)',textA,setTextA],['Modified (B)',textB,setTextB]].map(([l,v,fn])=>(
            <div key={l as string} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">{l as string}</div>
              <textarea value={v as string} onChange={e=>(fn as (s:string)=>void)(e.target.value)} rows={8}
                className="w-full p-3 font-mono text-sm focus:outline-none resize-none" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-3 text-sm">
            <span className="text-green-600 font-medium">+{added} added</span>
            <span className="text-red-500 font-medium">-{removed} removed</span>
            <span className="text-gray-400">{unchanged} unchanged</span>
          </div>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={ignore} onChange={e=>setIgnore(e.target.checked)} className="rounded" />
            Ignore case
          </label>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">Diff Output</div>
          <div className="p-2 font-mono text-sm overflow-auto max-h-[500px]">
            {diffs.map((d,i)=>(
              <div key={i} className={'px-3 py-0.5 rounded '+(d.type==='add'?'bg-green-50 text-green-800':d.type==='remove'?'bg-red-50 text-red-800':'text-gray-600')}>
                <span className="select-none mr-2 text-xs opacity-50">{d.type==='add'?'+':d.type==='remove'?'-':' '}</span>
                <span className="whitespace-pre">{d.text||'\u00A0'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}