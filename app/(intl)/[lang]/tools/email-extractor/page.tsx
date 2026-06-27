'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g


const tool = getToolBySlug('email-extractor')!

export default function EmailExtractorPage() {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [unique, setUnique] = useState(true)
  const [copied, setCopied] = useState(false)

  const rawMatches = input.match(EMAIL_RE) || []
  const emails = unique ? [...new Set(rawMatches)] : rawMatches

  function copy() {
    navigator.clipboard.writeText(emails.join('\n'))
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ee_title')}</h1>
        <p className="text-gray-500 mb-8">{t('ee_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ee_paste')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8}
              placeholder={t('ee_ph')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={unique} onChange={e=>setUnique(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">{t('ee_dedup')}</span>
          </label>
        </div>
        {emails.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">{t('ee_found',{n:emails.length})}</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 '+t('ui_copied'):t('ui_copy_all')}</button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {emails.map((e,i)=>(
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-brand-50 rounded-lg group">
                  <span className="font-mono text-sm text-gray-700">{e}</span>
                  <button onClick={()=>navigator.clipboard.writeText(e)} className="text-xs text-gray-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{t('ui_copy')}</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {input&&emails.length===0&&(
          <div className="mt-4 text-center text-gray-500 py-6">{t('ee_none')}</div>
        )}
      </div>
    </ToolLayout>
  )
}