'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('sql-formatter')!
const KEYWORDS=['SELECT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS','ON','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','ALTER','ADD','COLUMN','INDEX','UNIQUE','PRIMARY','KEY','FOREIGN','REFERENCES','AS','DISTINCT','COUNT','SUM','AVG','MIN','MAX','CASE','WHEN','THEN','ELSE','END','EXISTS','BETWEEN','LIKE','UNION','ALL','INTERSECT','EXCEPT','WITH','RECURSIVE']
function formatSQL(raw:string):string{
  let s=raw.replace(/s+/g,' ').trim()
  s=s.replace(/,s*/g,',
  ')
  const kw=KEYWORDS.join('|')
  const re=new RegExp('\\b('+kw+')\\b','gi')
  s=s.replace(re,m=>m.toUpperCase())
  s=s.replace(/SELECT/g,'SELECT')
  s=s.replace(/FROM/g,'
FROM')
  s=s.replace(/(LEFT|RIGHT|INNER|OUTER|FULL|CROSS)?s*JOIN/g,'
$1 JOIN')
  s=s.replace(/WHERE/g,'
WHERE')
  s=s.replace(/AND/g,'
  AND')
  s=s.replace(/OR/g,'
  OR')
  s=s.replace(/GROUP BY/g,'
GROUP BY')
  s=s.replace(/ORDER BY/g,'
ORDER BY')
  s=s.replace(/HAVING/g,'
HAVING')
  s=s.replace(/LIMIT/g,'
LIMIT')
  s=s.replace(/OFFSET/g,'
OFFSET')
  s=s.replace(/UNION( ALL)?/g,'
UNION$1
')
  return s.split('
').map(l=>l.trim()).filter(Boolean).join('
')
}
function highlight(sql:string):string{
  const kw=KEYWORDS.join('|')
  let h=sql.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  h=h.replace(/'[^']*'/g,'<span style="color:#22c55e">$&</span>')
  h=h.replace(/(d+.?d*)/g,'<span style="color:#f59e0b">$1</span>')
  h=h.replace(new RegExp('\\b('+kw+')\\b','g'),'<span style="color:#60a5fa;font-weight:600">$1</span>')
  return h
}
const SAMPLE="select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at > '2024-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 0 order by total_spent desc limit 50"
export default function SqlFormatterPage() {
  const [input,setInput]=useState(SAMPLE)
  const [copied,setCopied]=useState(false)
  const formatted=formatSQL(input)
  const copy=()=>{navigator.clipboard.writeText(formatted);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Input SQL</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder="Paste your SQL query here..."/></div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-medium">Formatted SQL</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-4 text-sm overflow-x-auto leading-relaxed" dangerouslySetInnerHTML={{__html:highlight(formatted)}}/>
        </div>
      </div>
    </ToolLayout>
  )
}