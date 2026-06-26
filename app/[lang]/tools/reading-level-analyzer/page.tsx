'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

// Flesch-Kincaid Grade Level and Reading Ease
function syllableCount(word:string):number{
  word=word.toLowerCase().replace(/[^a-z]/g,'')
  if(word.length<=3) return 1
  word=word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'')
  word=word.replace(/^y/,'')
  const matches=word.match(/[aeiouy]{1,2}/g)
  return matches?matches.length:1
}

function analyze(text:string,t:(k:string)=>string){
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0)
  const words=text.split(/\s+/).filter(w=>w.replace(/[^a-zA-Z]/g,'').length>0)
  const syllables=words.reduce((s,w)=>s+syllableCount(w),0)

  if(words.length===0||sentences.length===0) return null

  const asl=words.length/sentences.length // avg sentence length
  const asw=syllables/words.length // avg syllables per word

  const fleschEase=206.835-1.015*asl-84.6*asw
  const fkGrade=0.39*asl+11.8*asw-15.59
  const colemanLiau=5.88*(words.length>0?text.replace(/[^a-zA-Z]/g,'').length/words.length:0)-29.6*(sentences.length/words.length)-15.8

  const easeLabel=fleschEase>=90?t('rla_e_veryeasy'):fleschEase>=80?t('rla_e_easy'):fleschEase>=70?t('rla_e_fairlyeasy'):fleschEase>=60?t('rla_e_standard'):fleschEase>=50?t('rla_e_fairlydiff'):fleschEase>=30?t('rla_e_diff'):t('rla_e_verydiff')
  const gradeLabel=Math.round(fkGrade)<=6?t('rla_g_elem'):Math.round(fkGrade)<=8?t('rla_g_middle'):Math.round(fkGrade)<=12?t('rla_g_high'):Math.round(fkGrade)<=16?t('rla_g_college'):t('rla_g_grad')

  return{sentences:sentences.length,words:words.length,syllables,asl:asl.toFixed(1),asw:asw.toFixed(2),fleschEase:fleschEase.toFixed(1),fkGrade:Math.max(0,fkGrade).toFixed(1),colemanLiau:Math.max(0,colemanLiau).toFixed(1),easeLabel,gradeLabel}
}

const SAMPLE="The quick brown fox jumps over the lazy dog. It was a sunny afternoon in the park. Children played happily while adults relaxed on benches nearby. The trees swayed gently in the warm summer breeze."


const tool = getToolBySlug('reading-level-analyzer')!

export default function ReadingLevelPage() {
  const t = useTranslations('toolui')
  const [text,setText]=useState(SAMPLE)
  const result=analyze(text,t)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('rla_title')}</h1>
        <p className="text-gray-500 mb-8">{t('rla_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('rla_paste')}</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>
        {result&&(
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-brand-700">{result.fkGrade}</div>
                <div className="text-sm text-gray-600 mt-1">Flesch-Kincaid Grade</div>
                <div className="text-xs text-brand-600 font-medium mt-0.5">{result.gradeLabel}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-green-700">{result.fleschEase}</div>
                <div className="text-sm text-gray-600 mt-1">Flesch Reading Ease</div>
                <div className="text-xs text-green-600 font-medium mt-0.5">{result.easeLabel}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[['rla_sentences',result.sentences],['lip_words',result.words],['rla_syllables',result.syllables],['rla_asl',t('rla_aslval',{n:result.asl})],['rla_asw',result.asw],['rla_coleman',result.colemanLiau]].map(([l,v])=>(
                <div key={l as string} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                  <div className="font-bold text-gray-900">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t(l as string)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}