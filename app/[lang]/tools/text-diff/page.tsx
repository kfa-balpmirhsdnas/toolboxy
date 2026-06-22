'use client'
import { useState } from 'react'

interface DiffPart { type: 'equal'|'add'|'remove'; text: string }

function computeDiff(a: string, b: string): DiffPart[] {
  const aLines = a.split('\n')
  const bLines = b.split('\n')
  const m = aLines.length, n = bLines.length
  const dp: number[][] = Array.from({length: m+1}, (_,i) => Array(n+1).fill(0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) {
    if(aLines[i-1]===bLines[j-1]) dp[i][j]=dp[i-1][j-1]+1
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1])
  }
  const parts: DiffPart[] = []
  let i=m, j=n
  const segs: DiffPart[] = []
  while(i>0||j>0) {
    if(i>0&&j>0&&aLines[i-1]===bLines[j-1]) { segs.push({type:'equal',text:aLines[i-1]}); i--;j--; }
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])) { segs.push({type:'add',text:bLines[j-1]}); j--; }
    else { segs.push({type:'remove',text:aLines[i-1]}); i--; }
  }
  return segs.reverse()
}

const SAMPLE_A = `The quick brown fox
jumps over the lazy dog.
This line is only in A.
Hello World`

const SAMPLE_B = `The quick brown fox
jumps over the lazy cat.
This line is only in B.
Hello World`

export default function TextDiff() {
  const [left, setLeft] = useState(SAMPLE_A)
  const [right, setRight] = useState(SAMPLE_B)
  const [view, setView] = useState<'split'|'unified'>('unified')

  const diff = computeDiff(left, right)
  const added = diff.filter(d=>d.type==='add').length
  const removed = diff.filter(d=>d.type==='remove').length

  const colors = { equal:'text-gray-700 bg-white', add:'text-green-800 bg-green-50', remove:'text-red-800 bg-red-50' }
  const prefix = { equal:' ', add:'+', remove:'-' }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Diff Checker</h1>
        <p className="text-gray-500 mb-8">Compare two texts and highlight differences line by line.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {[{label:'Original (A)',val:left,set:setLeft},{label:'Modified (B)',val:right,set:setRight}].map(({label,val,set})=>(
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
              <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <button onClick={()=>set('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <textarea value={val} onChange={e=>set(e.target.value)} className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={10} spellCheck={false}/>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex gap-1">
            {(['unified','split'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view===v?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600'}`}>{v==='unified'?'Unified':'Split'}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-lg">+{added} added</span>
            <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-lg">−{removed} removed</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diff Output</span>
          </div>
          <div className="font-mono text-sm overflow-x-auto">
            {diff.map((part,i)=>(
              <div key={i} className={`px-4 py-0.5 ${colors[part.type]} ${part.type!=='equal'?'border-l-4':'border-l-4 border-transparent'} ${part.type==='add'?'border-green-400':part.type==='remove'?'border-red-400':''}`}>
                <span className="select-none mr-3 text-gray-400 text-xs">{prefix[part.type]}</span>
                <span>{part.text||' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}