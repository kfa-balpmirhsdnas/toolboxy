'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('diff-checker')!

type LineType = 'same'|'added'|'removed'

interface DiffLine { type: LineType; text: string; lineA?: number; lineB?: number }

function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const result: DiffLine[] = []
  
  // Simple LCS-based diff
  const m = linesA.length, n = linesB.length
  const dp: number[][] = Array.from({ length: m+1 }, () => new Array(n+1).fill(0))
  for (let i = m-1; i >= 0; i--) {
    for (let j = n-1; j >= 0; j--) {
      if (linesA[i] === linesB[j]) dp[i][j] = dp[i+1][j+1]+1
      else dp[i][j] = Math.max(dp[i+1][j], dp[i][j+1])
    }
  }
  
  let i=0,j=0,la=1,lb=1
  while (i<m || j<n) {
    if (i<m && j<n && linesA[i]===linesB[j]) {
      result.push({ type:'same', text:linesA[i], lineA:la++, lineB:lb++ }); i++;j++
    } else if (j<n && (i>=m || dp[i][j+1]>=dp[i+1][j])) {
      result.push({ type:'added', text:linesB[j], lineB:lb++ }); j++
    } else {
      result.push({ type:'removed', text:linesA[i], lineA:la++ }); i++
    }
  }
  return result
}

export default function DiffCheckerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const tracked = useRef(false)

  function compare() {
    if (!tracked.current) { trackToolUsed('diff-checker'); tracked.current = true }
    setShowDiff(true)
  }

  const diff = showDiff ? diffLines(textA, textB) : []
  const added = diff.filter(d=>d.type==='added').length
  const removed = diff.filter(d=>d.type==='removed').length

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!showDiff ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('cm_original')}</label>
                <textarea value={textA} onChange={e=>setTextA(e.target.value)} placeholder={t('df_ph_orig')} rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('df_modified')}</label>
                <textarea value={textB} onChange={e=>setTextB(e.target.value)} placeholder={t('df_ph_mod')} rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
            </div>
            <button onClick={compare} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">{t('df_compare')}</button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">+{added} {t('df_added')}</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">-{removed} {t('df_removed')}</span>
              <button onClick={()=>setShowDiff(false)} className="ml-auto text-xs text-brand-600 hover:underline">{t('df_edit')}</button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden font-mono text-xs">
              {diff.map((line, i) => (
                <div key={i} className={'flex items-stretch ' + (line.type==='added'?'bg-green-50':line.type==='removed'?'bg-red-50':'bg-white')}>
                  <div className="w-8 flex-shrink-0 text-center py-1 text-gray-400 border-r border-gray-100 select-none">
                    {line.lineA||''}
                  </div>
                  <div className="w-8 flex-shrink-0 text-center py-1 text-gray-400 border-r border-gray-100 select-none">
                    {line.lineB||''}
                  </div>
                  <div className={'w-4 flex-shrink-0 text-center py-1 font-bold ' + (line.type==='added'?'text-green-600':line.type==='removed'?'text-red-600':'text-gray-300')}>
                    {line.type==='added'?'+':line.type==='removed'?'-':' '}
                  </div>
                  <div className={'flex-1 py-1 px-2 whitespace-pre-wrap break-all ' + (line.type==='added'?'text-green-800':line.type==='removed'?'text-red-800':'text-gray-700')}>
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
