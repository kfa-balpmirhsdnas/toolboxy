'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function isPalindrome(s: string): boolean { return s === s.split('').reverse().join('') }

function checkNumber(n: string) {
  const clean = n.trim()
  if (!clean || isNaN(Number(clean))) return null
  const isP = isPalindrome(clean.replace('-',''))
  const reversed = clean.split('').reverse().join('')
  return { value: clean, isP, reversed, digits: clean.replace('-','').length }
}

function lychrel(n: number, maxSteps=50): { steps: Array<{n:number,r:number,sum:number}>; isPalindrome: boolean } {
  const steps=[];let cur=n
  for(let i=0;i<maxSteps;i++){
    const rev=Number(String(cur).split('').reverse().join(''))
    const sum=cur+rev
    steps.push({n:cur,r:rev,sum})
    if(isPalindrome(String(sum))){return{steps,isPalindrome:true}}
    cur=sum
  }
  return{steps,isPalindrome:false}
}

function palindromesInRange(from:number,to:number):number[]{
  const r=[];for(let i=from;i<=Math.min(to,10000);i++) if(isPalindrome(String(i)))r.push(i);return r
}


const tool = getToolBySlug('number-palindrome')!

export default function NumberPalindrome() {
  const [input,setInput]=useState('12321')
  const [tab,setTab]=useState<'check'|'reverse'|'range'>('check')
  const [from,setFrom]=useState('1')
  const [to,setTo]=useState('200')
  const result=checkNumber(input)
  const lychrelResult=result&&!result.isP?lychrel(Number(result.value)):null
  const rangeRes=palindromesInRange(parseInt(from)||1,parseInt(to)||200)
  const tabs=[{k:'check',l:'Check Number'},{k:'reverse',l:'Reverse Addition'},{k:'range',l:'Find in Range'}] as const
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number Palindrome Checker</h1>
        <p className="text-gray-500 mb-8">Check if numbers are palindromes, find them in ranges, and explore reverse-addition.</p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab===t.k?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t.l}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {tab==='check' && (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter a number</label>
              <input type="text" value={input} onChange={e=>setInput(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-center tracking-widest"/>
              {result && (
                <div>
                  <div className={`text-center p-6 rounded-xl mb-4 ${result.isP?'bg-green-50 border-2 border-green-200':'bg-orange-50 border-2 border-orange-200'}`}>
                    <div className="text-4xl mb-2">{result.isP?'🔄':'↔'}</div>
                    <div className={`text-2xl font-bold ${result.isP?'text-green-700':'text-orange-700'}`}>
                      {result.value} is {result.isP?'':'NOT '}<strong>a palindrome</strong>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
                    <div><p className="text-xs text-gray-500 mb-1">Original</p><p className="font-mono text-xl font-bold text-gray-800 tracking-widest">{result.value}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Reversed</p><p className={`font-mono text-xl font-bold tracking-widest ${result.isP?'text-green-700':'text-red-600'}`}>{result.reversed}</p></div>
                  </div>
                </div>
              )}
            </>
          )}
          {tab==='reverse' && (
            <>
              <p className="text-sm text-gray-600 mb-4">The reverse-addition process: repeatedly add a number to its reverse until a palindrome is reached.</p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Starting number</label>
              <input type="text" value={input} onChange={e=>setInput(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"/>
              {result && result.isP && <p className="text-green-700 font-medium text-center py-4">✓ Already a palindrome!</p>}
              {result && !result.isP && lychrelResult && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">{lychrelResult.isPalindrome?<span className="text-green-700 font-medium">✓ Palindrome reached in {lychrelResult.steps.length} step(s)!</span>:<span className="text-red-600 font-medium">⚠ Possible Lychrel number (no palindrome after 50 steps)</span>}</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lychrelResult.steps.slice(0,10).map((s,i)=>(
                      <div key={i} className="flex items-center gap-2 text-sm font-mono bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-500 w-6">{i+1}.</span>
                        <span>{s.n}</span><span className="text-gray-400">+</span><span>{s.r}</span><span className="text-gray-400">=</span>
                        <span className={`font-bold ${isPalindrome(String(s.sum))?'text-green-700':'text-gray-800'}`}>{s.sum}</span>
                        {isPalindrome(String(s.sum))&&<span className="text-green-600 text-xs">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {tab==='range' && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">From</label><input type="number" value={from} onChange={e=>setFrom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none"/></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">To (max 10,000)</label><input type="number" value={to} onChange={e=>setTo(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none"/></div>
              </div>
              <p className="text-sm text-gray-600 mb-3">Found <strong>{rangeRes.length}</strong> palindromes:</p>
              <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto">
                {rangeRes.map(p=><span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm font-mono">{p}</span>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}