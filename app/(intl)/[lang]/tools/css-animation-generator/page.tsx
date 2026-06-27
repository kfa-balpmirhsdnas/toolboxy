'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const PRESETS=[
  {name:'cag_p_fade',kf:'@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',prop:'fadeIn'},
  {name:'cag_p_slide',kf:'@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',prop:'slideUp'},
  {name:'cag_p_bounce',kf:'@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }',prop:'bounce'},
  {name:'cag_p_spin',kf:'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',prop:'spin'},
  {name:'cag_p_pulse',kf:'@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }',prop:'pulse'},
  {name:'cag_p_shake',kf:'@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }',prop:'shake'},
]
export default function Page(){
  const t = useTranslations('toolui')
  const [sel,setSel]=useState(0)
  const [dur,setDur]=useState(1)
  const [iter,setIter]=useState('infinite')
  const [timing,setTiming]=useState('ease')
  const p=PRESETS[sel]
  const anim=p.prop+' '+dur+'s '+timing+' '+iter
  const css=p.kf+'\n.animated { animation: '+anim+'; }'
  const tool=TOOLS.find(x=>x.slug==='css-animation-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((pr,i)=><button key={i} onClick={()=>setSel(i)} className={'px-3 py-1.5 rounded text-sm font-medium border '+(sel===i?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{t(pr.name)}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cag_duration')}
            <input type="number" min={0.1} max={10} step={0.1} value={dur} onChange={e=>setDur(+e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm"/>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cag_timing')}
            <select value={timing} onChange={e=>setTiming(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
              {['ease','linear','ease-in','ease-out','ease-in-out'].map(o=><option key={o}>{o}</option>)}
            </select></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cag_iteration')}
            <select value={iter} onChange={e=>setIter(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
              {['infinite','1','2','3'].map(o=><option key={o}>{o}</option>)}
            </select></label>
        </div>
        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-10 border border-gray-200">
          <style>{p.kf}</style>
          <div style={{animation:anim,width:60,height:60,borderRadius:8,background:'#3b82f6'}}/>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">CSS</label>
          <textarea value={css} readOnly rows={4} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(css)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{t('ct_copycss')}</button>
      </div>
    </ToolLayout>
  )
}