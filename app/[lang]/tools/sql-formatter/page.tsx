'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('sql-formatter')!
const KEYWORDS=['SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','ON','AND','OR','NOT','IN','IS','NULL','AS','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','ADD','DROP','INDEX','PRIMARY','KEY','FOREIGN','REFERENCES','DISTINCT','COUNT','SUM','AVG','MAX','MIN','CASE','WHEN','THEN','ELSE','END','UNION','ALL','EXISTS','BETWEEN','LIKE','WITH','CTE']
function formatSql(sql:string,indent:string):string{
  let result=sql.trim()
  const re=new RegExp('\\b('+KEYWORDS.join('|')+')\\b','gi')
  result=result.replace(re,(_,kw)=>kw.toUpperCase())
  result=result.replace(/\s*,\s*/g,',\n'+indent)
  result=result.replace(/\bSELECT\b/gi,'SELECT\n'+indent)
  result=result.replace(/\bFROM\b/gi,'\nFROM')
  result=result.replace(/\b(LEFT|RIGHT|INNER|OUTER|FULL)?\s*JOIN\b/gi,'\n$1 JOIN')
  result=result.replace(/\bON\b/gi,'\n  ON')
  result=result.replace(/\bWHERE\b/gi,'\nWHERE')
  result=result.replace(/\bAND\b/gi,'\n  AND')
  result=result.replace(/\bOR\b/gi,'\n  OR')
  result=result.replace(/\bORDER\s+BY\b/gi,'\nORDER BY')
  result=result.replace(/\bGROUP\s+BY\b/gi,'\nGROUP BY')
  result=result.replace(/\bHAVING\b/gi,'\nHAVING')
  result=result.replace(/\bLIMIT\b/gi,'\nLIMIT')
  result=result.replace(/\n\s*\n/g,'\n')
  return result.trim()
}
export default function SqlFormatterPage() {
  const [input,setInput]=useState('select u.id, u.name, count(o.id) as order_count from users u left join orders o on u.id = o.user_id where u.active = 1 and u.created_at > "2024-01-01" group by u.id, u.name having count(o.id) > 5 order by order_count desc limit 20')
  const [indent,setIndent]=useState('  ')
  const [copied,setCopied]=useState(false)
  const output=input?formatSql(input,indent):''
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Indent:</label>
          {[['2 spaces','  '],['4 spaces','    '],['tab','\t']].map(([label,val])=>(
            <label key={label} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="indent" checked={indent===val} onChange={()=>setIndent(val)}/>
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Input SQL</label>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={12}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Formatted SQL</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={12}
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}