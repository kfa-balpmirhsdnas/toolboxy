'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function fmt(sql){
  let s=sql.replace(/\s+/g,' ').trim()
  const KW=['SELECT','FROM','WHERE','LEFT JOIN','RIGHT JOIN','INNER JOIN','JOIN','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','UNION ALL','UNION','WITH']
  for(const k of KW){const re=new RegExp('\\b'+k.replace(/ /g,'\\s+')+'\\b','gi');s=s.replace(re,'\n'+k)}
  s=s.replace(/\b(AND|OR)\b/gi,'\n  $1')
  s=s.replace(/,(?!\s)/g,', ')
  return s.replace(/^\n/,'').trim()
}
export default function Page(){
  const [input,setInput]=useState("select u.name, count(o.id) as cnt from users u left join orders o on u.id=o.user_id where u.active=1 and o.total>100 group by u.id order by cnt desc limit 10")
  const output=fmt(input)
  const tool=TOOLS.find(t=>t.slug==='sql-formatter')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">SQL Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Formatted</label>
          <textarea value={output} readOnly rows={12} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
      </div>
    </ToolLayout>
  )
}