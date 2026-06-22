'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function clean(s:string,ignoreCase:boolean,ignoreSpaces:boolean,ignorePunct:boolean):string{
  let r=s
  if(ignorePunct) r=r.replace(/[^a-zA-Z0-9\s]/g,'')
  if(ignoreSpaces) r=r.replace(/\s/g,'')
  if(ignoreCase) r=r.toLowerCase()
  return r
}

const EXAMPLES=['racecar','A man a plan a canal Panama','Never odd or even','Was it a car or a cat I saw','Hello World','Madam Im Adam','No lemon no melon']


const tool = getToolBySlug('palindrome-checker')!

export default function PalindromeCheckerPage() {
  const [input,setInput]=useState('')
  const [ignoreCase,setIgnoreCase]=useState(true)
  const [ignoreSpaces,setIgnoreSpaces]=useState(true)
  const [ignorePunct,setIgnorePunct]=useState(true)

  const cleaned=clean(input,ignoreCase,ignoreSpaces,ignorePunct)
  const reversed=cleaned.split('').reverse().join('')
  const isPalin=cleaned.length>0&&cleaned===reversed

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Palindrome Checker</h1>
        <p className="text-gray-500 mb-8">Check if a word, phrase, or sentence reads the same forwards and backwards</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter text</label>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. racecar"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex flex-wrap gap-3">
            {([['ignoreCase','Ignore case',ignoreCase,setIgnoreCase],['ignoreSpaces','Ignore spaces',ignoreSpaces,setIgnoreSpaces],['ignorePunct','Ignore punctuation',ignorePunct,setIgnorePunct]] as [string,string,boolean,(v:boolean)=>void][]).map(([id,label,val,fn])=>(
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={e=>fn(e.target.checked)} className="rounded" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          {input&&(
            <div className={'rounded-xl p-4 text-center border '+(isPalin?'bg-green-50 border-green-200':'bg-red-50 border-red-200')}>
              <div className={'text-4xl mb-2'}>{isPalin?'\u2713':'\u00D7'}</div>
              <p className={'text-xl font-bold '+(isPalin?'text-green-700':'text-red-600')}>
                {isPalin?'Yes, it\u2019s a palindrome!':'Not a palindrome'}
              </p>
              {cleaned&&(
                <div className="mt-3 text-sm text-gray-500">
                  <p>Normalized: <span className="font-mono">{cleaned}</span></p>
                  <p>Reversed: <span className="font-mono">{reversed}</span></p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Famous Palindromes</h2>
          <div className="space-y-1">
            {EXAMPLES.map(ex=>(
              <button key={ex} onClick={()=>setInput(ex)} className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors">
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}