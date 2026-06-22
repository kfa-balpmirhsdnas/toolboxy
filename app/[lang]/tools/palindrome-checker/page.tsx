'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('palindrome-checker')!
function normalize(s:string,ignoreSpaces:boolean,ignoreCase:boolean):string{
  let r=s
  if(ignoreCase)r=r.toLowerCase()
  if(ignoreSpaces)r=r.replace(/[^a-zA-Z0-9]/g,'')
  return r
}
const EXAMPLES=['racecar','A man a plan a canal Panama','Was it a car or a cat I saw','level','hello','radar','Never odd or even','Do geese see God']
export default function PalindromeCheckerPage() {
  const [text,setText]=useState('A man a plan a canal Panama')
  const [ignoreSpaces,setIgnoreSpaces]=useState(true)
  const [ignoreCase,setIgnoreCase]=useState(true)
  const norm=normalize(text,ignoreSpaces,ignoreCase)
  const reversed=norm.split('').reverse().join('')
  const isPalin=norm===reversed&&norm.length>0
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text to check</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={ignoreSpaces} onChange={e=>setIgnoreSpaces(e.target.checked)} className="rounded"/>
            Ignore spaces & punctuation
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={ignoreCase} onChange={e=>setIgnoreCase(e.target.checked)} className="rounded"/>
            Ignore case
          </label>
        </div>
        {text&&(
          <div className={`rounded-2xl p-6 text-center ${isPalin?'bg-green-50 border-2 border-green-400':'bg-red-50 border-2 border-red-400'}`}>
            <p className="text-5xl mb-2">{isPalin?'✅':'❌'}</p>
            <p className={`text-xl font-bold ${isPalin?'text-green-700':'text-red-700'}`}>
              {isPalin?'Palindrome!':'Not a palindrome'}
            </p>
            {norm.length>0&&<div className="mt-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">Normalized: <span className="text-gray-700">{norm}</span></p>
              <p className="text-gray-500">Reversed: <span className="text-gray-700">{reversed}</span></p>
            </div>}
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 mb-2">Try these examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e=>(
              <button key={e} onClick={()=>setText(e)} className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{e}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}