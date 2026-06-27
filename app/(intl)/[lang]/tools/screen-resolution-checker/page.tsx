'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('screen-resolution-checker')!
const COMMON=[
  {name:'720p HD',w:1280,h:720},{name:'1080p FHD',w:1920,h:1080},{name:'1440p QHD',w:2560,h:1440},
  {name:'4K UHD',w:3840,h:2160},{name:'MacBook 13"',w:2560,h:1600},{name:'MacBook Pro 16"',w:3456,h:2234},
  {name:'iPhone 14',w:390,h:844},{name:'iPhone 14 Pro Max',w:430,h:932},{name:'iPad Pro 12.9"',w:1024,h:1366},
  {name:'Galaxy S23',w:360,h:780},{name:'Surface Pro',w:1368,h:912},
]
function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}
export default function ScreenResolutionCheckerPage() {
  const t = useTranslations('toolui')
  const [info,setInfo]=useState({sw:0,sh:0,iw:0,ih:0,dpr:1,cw:0,ch:0,ow:0,oh:0})
  useEffect(()=>{
    const update=()=>setInfo({
      sw:screen.width,sh:screen.height,
      iw:window.innerWidth,ih:window.innerHeight,
      dpr:window.devicePixelRatio||1,
      cw:document.documentElement.clientWidth,ch:document.documentElement.clientHeight,
      ow:window.outerWidth,oh:window.outerHeight,
    })
    update()
    window.addEventListener('resize',update)
    return()=>window.removeEventListener('resize',update)
  },[])
  const g=gcd(info.sw,info.sh)
  const ratio=info.sw>0?info.sw/g+':'+info.sh/g:'—'
  const mp=(info.sw*info.sh*info.dpr*info.dpr/1000000).toFixed(1)
  const match=COMMON.find(c=>c.w===info.sw&&c.h===info.sh)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <p className="text-xs opacity-80 mb-1">{t('sr_title')}</p>
          <p className="text-5xl font-bold font-mono">{info.sw} x {info.sh}</p>
          {match&&<p className="mt-2 bg-white bg-opacity-20 rounded-full px-3 py-0.5 inline-block text-sm">{match.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {k:'sr_viewport',val:info.iw+' x '+info.ih+'px'},
            {k:'sr_dpr',val:info.dpr+'x'},
            {k:'sr_physical',val:Math.round(info.sw*info.dpr)+' x '+Math.round(info.sh*info.dpr)+'px'},
            {k:'ar_aspect',val:ratio},
            {k:'sr_mp',val:mp+' MP'},
            {k:'sr_outer',val:info.ow+' x '+info.oh+'px'},
          ].map(r=>(
            <div key={r.k} className="bg-gray-50 rounded-xl px-3 py-3">
              <p className="text-xs text-gray-500">{t(r.k)}</p>
              <p className="font-bold text-gray-800 font-mono mt-0.5">{r.val}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('sr_compare')}</p>
          <div className="space-y-1">
            {COMMON.map(c=>{
              const current=c.w===info.sw&&c.h===info.sh
              return(
                <div key={c.name} className={'flex items-center gap-3 rounded-lg px-3 py-1.5 '+(current?'bg-blue-50 border border-blue-200':'')}>
                  <div className="w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0" style={{background:current?'#3b82f6':'transparent'}}/>
                  <span className="text-xs text-gray-600 flex-1">{c.name}</span>
                  <span className="text-xs font-mono text-gray-700">{c.w} x {c.h}</span>
                  {current&&<span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">{t('sr_you')}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}