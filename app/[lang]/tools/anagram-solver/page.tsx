'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('anagram-solver')!
function sortLetters(s:string):string{return s.toLowerCase().replace(/\s/g,'').split('').sort().join('')}
function isAnagram(a:string,b:string):boolean{return sortLetters(a)===sortLetters(b)}
const WORD_LIST=['listen','silent','enlist','inlets','tinsel','google','gooegl','triangle','integral','alerting','relating','eat','tea','ate','eta','state','taste','waste','sweat','weats','earth','heart','heart','hater','rathe','hate','heat','tale','late','teal','tale','care','race','acre','dear','dare','read']
export default function AnagramSolverPage() {
  const t = useTranslations('toolui')
  const [word,setWord]=useState('listen')
  const [custom,setCustom]=useState('')
  const [mode,setMode]=useState<'check'|'find'>('check')
  const sorted=sortLetters(word)
  const anagrams=mode==='find'?[...new Set(WORD_LIST.filter(w=>w!==word.toLowerCase()&&isAnagram(w,word)))]
    :[]
  const checkResult=custom?isAnagram(word,custom):null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('check')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='check'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('as_check')}</button>
          <button onClick={()=>setMode('find')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='find'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>{t('as_find')}</button>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{mode==='check'?t('as_first'):t('as_findword')}</label>
          <input value={word} onChange={e=>setWord(e.target.value)} placeholder={t('as_ph1')} className="w-full rounded border border-gray-300 px-3 py-2 text-lg"/></div>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-center">
          <span className="text-gray-500">{t('as_sorted')}</span>
          <span className="text-blue-700 font-bold tracking-widest">{sorted.toUpperCase()}</span>
        </div>
        {mode==='check'?(
          <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('as_second')}</label>
              <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder={t('as_ph2')} className="w-full rounded border border-gray-300 px-3 py-2 text-lg"/></div>
            {checkResult!==null&&(
              <div className={`rounded-2xl p-6 text-center ${checkResult?'bg-green-50 border-2 border-green-400':'bg-red-50 border-2 border-red-400'}`}>
                <p className="text-4xl mb-2">{checkResult?'✅':'❌'}</p>
                <p className={`text-xl font-bold ${checkResult?'text-green-700':'text-red-700'}`}>
                  {checkResult?t('as_yes'):t('as_no')}
                </p>
              </div>
            )}
          </>
        ):(
          <div>
            {anagrams.length>0?(
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('as_found',{n:anagrams.length})}</p>
                <div className="flex flex-wrap gap-2">
                  {anagrams.map(a=>(
                    <span key={a} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">{a}</span>
                  ))}
                </div>
              </div>
            ):(
              <p className="text-center text-gray-400 py-4">{t('as_none',{w:word})}</p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}