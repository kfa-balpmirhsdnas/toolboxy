'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('sql-formatter')!

const KW = ['SELECT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL','AS','ON','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','DROP TABLE','ALTER TABLE','UNION','UNION ALL','DISTINCT','COUNT','SUM','AVG','MIN','MAX','CASE','WHEN','THEN','ELSE','END','WITH']

function formatSQL(sql: string, indent: number): string {
  const tab = ' '.repeat(indent)
  let result = sql.trim()
  
  // Normalize whitespace
  result = result.replace(/\s+/g,' ')
  
  // Add newlines before keywords
  const breakKws = ['SELECT','FROM','WHERE','AND','OR','GROUP BY','ORDER BY','HAVING','LIMIT','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','FULL JOIN','CROSS JOIN','JOIN','UNION ALL','UNION','INSERT INTO','VALUES','SET','DELETE','UPDATE']
  for (const kw of breakKws) {
    const re = new RegExp('\\b(' + kw.replace(/ /g,'\\s+') + ')\\b', 'gi')
    result = result.replace(re, '\n$1')
  }
  
  // Indent AND/OR
  result = result.replace(/\n(AND|OR)\b/gi, '\n' + tab + '$1')
  
  // Uppercase keywords
  for (const kw of KW) {
    const re = new RegExp('\\b(' + kw.replace(/ /g,'\\s+') + ')\\b', 'gi')
    result = result.replace(re, kw)
  }
  
  return result.trim().replace(/\n{3,}/g,'\n\n')
}

export default function SqlFormatterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('sql-formatter'); tracked.current = true }
  }

  const output = input.trim() ? formatSQL(input, indent) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('sql-formatter')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function download() {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='formatted.sql'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('sql-formatter','sql')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <label className="text-xs font-medium text-gray-600">Indent</label>
          {[2,4].map(n=>(
            <button key={n} onClick={()=>setIndent(n)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (indent===n?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {n} spaces
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SQL Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="SELECT * FROM users WHERE id = 1 AND active = true ORDER BY name;" rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Formatted SQL</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
              </div>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-72 whitespace-pre">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
