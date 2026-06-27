'use client'
import {useState,useMemo} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const t = useTranslations('toolui')
  const [csv,setCsv]=useState('Name,Age,City\nAlice,30,New York\nBob,25,London')
  const [delim,setDelim]=useState(',')
  const rows=useMemo(()=>csv.trim().split('\n').map(r=>r.split(delim)),[csv,delim])
  const headers=rows[0]||[]
  const data=rows.slice(1)
  const tool=TOOLS.find(x=>x.slug==='csv-viewer')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">{t('cvw_input')}</label>
            <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={5} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
          <div className="w-28"><label className="block text-sm font-medium text-gray-700 mb-1">{t('cvw_delim')}</label>
            <select value={delim} onChange={e=>setDelim(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              <option value=",">{', '+t('ns_comma')}</option><option value=";">{'; '+t('cvw_semicolon')}</option>
              <option value="|">{'| '+t('cvw_pipe')}</option>
            </select></div>
        </div>
        {headers.length>0&&<div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{headers.map((h,i)=><th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">{data.map((row,i)=>(
              <tr key={i} className="hover:bg-gray-50">{headers.map((_,j)=><td key={j} className="px-4 py-2 text-sm font-mono text-gray-800">{row[j]||''}</td>)}</tr>
            ))}</tbody>
          </table></div>}
        <p className="text-xs text-gray-400">{t('cvw_stats',{r:data.length,c:headers.length})}</p>
      </div>
    </ToolLayout>
  )
}