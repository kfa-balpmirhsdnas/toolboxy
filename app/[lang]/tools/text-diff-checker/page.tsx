'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-diff-checker')!
type Chunk={type:'same'|'added'|'removed';text:string}
function lcs(a:string[],b:string[]):number[][]{
  const m=a.length,n=b.length
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0))
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1])
  return dp
}
function diff(a:string,b:string):Chunk[]{
  const aL=a.split('
'),bL=b.split('
')
  const dp=lcs(aL,bL)
  const chunks:Chunk[]=[]
  let i=aL.length,j=bL.length
  const result:{type:'same'|'added'|'removed';text:string}[]=[]
  while(i>0||j>0){
    if(i>0&&j>0&&aL[i-1]===bL[j-1]){result.unshift({type:'same',text:aL[i-1]});i--;j--}
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){result.unshift({type:'added',text:bL[j-1]});j--}
    else{result.unshift({type:'removed',text:aL[i-1]});i--}
  }
  return result
}
export default function TextDiffCheckerPage() {
  const [left,setLeft]=useState('The quick brown fox\njumps over the lazy dog\nHello World\nLine four')
  const [right,setRight]=useState('The quick brown fox\nleaps over the lazy cat\nHello World\nLine five\nNew line added')
  const [result,setResult]=useState<Chunk[]|null>(null)
  const check=()=>setResult(diff(left,right))
  const added=result?.filter(c=>c.type==='added').length||0
  const removed=result?.filter(c=>c.type==='removed').length||0
  const COL={same:'bg-white text-gray-800',added:'bg-green-50 text-green-800 border-l-4 border-green-400',removed:'bg-red-50 text-red-800 border-l-4 border-red-400 line-through opacity-70'}
  const PREFIX={same:'  ',added:'+ ',removed:'- '}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Original text</label>
            <textarea value={left} onChange={e=>setLeft(e.target.value)} rows={8} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Modified text</label>
            <textarea value={right} onChange={e=>setRight(e.target.value)} rows={8} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
        </div>
        <button onClick={check} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Compare Text</button>
        {result&&(
          <div>
            <div className="flex gap-3 text-sm mb-2">
              <span className="text-green-600 font-medium">+{added} added</span>
              <span className="text-red-600 font-medium">-{removed} removed</span>
              <span className="text-gray-500">{result.filter(c=>c.type==='same').length} unchanged</span>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden font-mono text-sm">
              {result.map((c,i)=>(
                <div key={i} className={'px-4 py-1.5 '+COL[c.type]}>
                  <span className="select-none text-gray-400 mr-2">{PREFIX[c.type]}</span>{c.text||' '}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}