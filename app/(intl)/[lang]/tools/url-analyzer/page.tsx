'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getToolBySlug } from '@/lib/tools/registry'

function parseUrl(raw: string, t: (k: string, v?: Record<string, unknown>) => string): { valid: boolean; url?: URL; warnings: string[] } {
  const warnings: string[] = []
  let str = raw.trim()
  if(!str.startsWith('http://') && !str.startsWith('https://')) str = 'https://' + str
  try {
    const url = new URL(str)
    if(url.protocol === 'http:') warnings.push(t('ua_w_http'))
    const ip4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)
    if(ip4) warnings.push(t('ua_w_ip'))
    const dots = (url.hostname.match(/\./g)||[]).length
    if(dots >= 3) warnings.push(t('ua_w_subs'))
    if(url.hostname.includes('--')) warnings.push(t('ua_w_hyphen'))
    const suspiciousWords = ['login','verify','secure','account','update','confirm','bank']
    const hostLower = url.hostname.toLowerCase()
    const found = suspiciousWords.filter(w=>hostLower.includes(w))
    if(found.length) warnings.push(t('ua_kw',{list:found.join(', ')}))
    return { valid: true, url, warnings }
  } catch {
    return { valid: false, warnings: [t('ua_invalid')] }
  }
}

function getRiskLevel(warnings: string[]): 'safe'|'caution'|'suspicious' {
  if(warnings.length === 0) return 'safe'
  if(warnings.length === 1 && warnings[0].includes('HTTP')) return 'caution'
  if(warnings.length >= 2) return 'suspicious'
  return 'caution'
}

const RISK_COLORS = { safe: 'green', caution: 'yellow', suspicious: 'red' } as const


const tool = getToolBySlug('url-analyzer')!

export default function UrlPreview() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('')
  const [analyzed,setAnalyzed]=useState<ReturnType<typeof parseUrl>|null>(null)

  const analyze = () => { if(input.trim()) setAnalyzed(parseUrl(input, t)) }

  const risk = analyzed?.valid ? getRiskLevel(analyzed.warnings) : null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ua_title')}</h1>
        <p className="text-gray-500 mb-8">{t('ua_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ua_enter')}</label>
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e=>{setInput(e.target.value);setAnalyzed(null)}}
              onKeyDown={e=>e.key==='Enter'&&analyze()}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/path?query=value"/>
            <button onClick={analyze} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">{t('ua_analyze')}</button>
          </div>
        </div>
        {analyzed && (
          <div className="space-y-4">
            {analyzed.valid && analyzed.url ? (
              <>
                <div className={`p-4 rounded-2xl border-2 ${risk==='safe'?'bg-green-50 border-green-200':risk==='caution'?'bg-yellow-50 border-yellow-200':'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{risk==='safe'?'✅':risk==='caution'?'⚠️':'🚨'}</span>
                    <div>
                      <p className={`font-bold text-lg ${risk==='safe'?'text-green-700':risk==='caution'?'text-yellow-700':'text-red-700'}`}>
                        {risk==='safe'?t('ua_safe'):risk==='caution'?t('ua_caution'):t('ua_suspicious')}
                      </p>
                      <p className="text-sm text-gray-500">{t('ua_concerns',{n:analyzed.warnings.length})}</p>
                    </div>
                  </div>
                  {analyzed.warnings.length>0&&(
                    <ul className="mt-3 space-y-1">
                      {analyzed.warnings.map((w,i)=><li key={i} className="text-sm font-medium text-gray-700">{w}</li>)}
                    </ul>
                  )}
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">{t('ua_breakdown')}</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[
                      ['ua_protocol',analyzed.url.protocol.replace(':','')],
                      ['ua_hostname',analyzed.url.hostname],
                      ['ua_port',analyzed.url.port||t('ua_default')],
                      ['ua_path',analyzed.url.pathname||'/'],
                      ['ua_query',analyzed.url.search||t('ua_none')],
                      ['ua_fragment',analyzed.url.hash||t('ua_none')],
                      ['ua_fullurl',analyzed.url.href],
                    ].map(([label,value])=>(
                      <div key={label} className="flex gap-4 px-5 py-3 items-start">
                        <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{t(label)}</span>
                        <span className="font-mono text-sm text-gray-800 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 font-medium">❌ {analyzed.warnings[0]}</div>
            )}
          </div>
        )}
        <div className="mt-6 bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
          <strong>{t('ua_note_label')}</strong> {t('ua_note_text')}
        </div>
      </div>
    </div>
  )
}