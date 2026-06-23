'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-diff-checker')!
type DiffLine={type:'equal'|'add'|'remove';text:string;lineA?:number;lineB?:number}
function computeDiff(a:string,b:string):DiffLine[]{
  const linesA=a.split('\n'),linesB=b.split('
')\n  const m=linesA.length,n=linesB.length
  const dp:number[][]=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?0:j===0?0:0))
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=linesA[i-1]===linesB[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1])
  const result:DiffLine[]=[];let i=m,j=n
  while(i>0||j>0){
    if(i>0&&j>0&&linesA[i-1]===linesB[j-1]){result.unshift({type:'equal',text:linesA[i-1],lineA:i,lineB:j});i--;j--}
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){result.unshift({type:'add',text:linesB[j-1],lineB:j});j--}
    else{result.unshift({type:'remove',text:linesA[i-1],lineA:i});i--}
  }
  return result
}
const TEXT_A='The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!'\nconst TEXT_B='The quick brown fox leaps over the sleepy dog.\nPack my box with five dozen liquor jugs.\nHow vexingly quick daft zebras jump!\nNew line added at the end.'
export default function TextDiffCheckerPage() {
  const [a,setA]=useState(TEXT_A)
  const [b,setB]=useState(TEXT_B)
  const diff=useMemo(()=>computeDiff(a,b),[a,b])
  const added=diff.filter(d=>d.type==='add').length
  const removed=diff.filter(d=>d.type==='remove').length
  const equal=diff.filter(d=>d.type==='equal').length
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Original text</label>
            <textarea value={a} onChange={e=>setA(e.target.value)} rows={6} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Modified text</label>
            <textarea value={b} onChange={e=>setB(e.target.value)} rows={6} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-blue-400"/></div>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-200 inline-block"/>Added: <strong>{added}</strong></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-200 inline-block"/>Removed: <strong>{removed}</strong></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block"/>Equal: <strong>{equal}</strong></div>
        </div>
        <div className="rounded-xl border border-gray-200 overflow-hidden font-mono text-xs">
          {diff.map((line,i)=>(
            <div key={i} className={'flex items-start gap-2 px-3 py-1 '+(line.type==='add'?'bg-green-50':line.type==='remove'?'bg-red-50':'bg-white')}>
              <span className="flex-shrink-0 w-8 text-right text-gray-300">{line.lineA||''}</span>
              <span className="flex-shrink-0 w-8 text-right text-gray-300">{line.lineB||''}</span>
              <span className={'flex-shrink-0 w-4 font-bold '+(line.type==='add'?'text-green-600':line.type==='remove'?'text-red-600':'text-gray-300')}>{line.type==='add'?'+':line.type==='remove'?'-':' '}</span>
              <span className={'whitespace-pre-wrap break-all '+(line.type==='add'?'text-green-800':line.type==='remove'?'text-red-800':'text-gray-700')}>{line.text}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}