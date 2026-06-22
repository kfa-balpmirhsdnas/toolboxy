'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const KEYWORDS = ['SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','ON',
  'AND','OR','NOT','IN','IS','NULL','AS','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','ALTER','ADD',
  'COLUMN','INDEX','PRIMARY','KEY','FOREIGN','REFERENCES','DISTINCT','COUNT','SUM','AVG',
  'MIN','MAX','UNION','ALL','EXISTS','BETWEEN','LIKE','CASE','WHEN','THEN','ELSE','END',
  'WITH','RETURNING','TRUNCATE','CONSTRAINT','DEFAULT','NOT NULL']

function formatSQL(sql: string): string {
  let s = sql.replace(/\s+/g, ' ').trim()
  // Uppercase keywords
  KEYWORDS.forEach(k => {
    s = s.replace(new RegExp('\\b' + k + '\\b', 'gi'), k)
  })
  // Add newlines before major clauses
  const clauses = ['SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN',
    'GROUP BY','ORDER BY','HAVING','LIMIT','UNION','INSERT INTO','UPDATE','SET','DELETE FROM']
  clauses.forEach(c => {
    s = s.replace(new RegExp('\\b' + c + '\\b', 'g'), '\n' + c)
  })
  // Indent columns in SELECT
  s = s.replace(/SELECT\n?/, 'SELECT\n  ')
  s = s.replace(/,(?=\S)/g, ',\n  ')
  return s.trim()
}


const tool = getToolBySlug('sql-formatter')!

export default function SQLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const format = () => setOutput(formatSQL(input))
  const copy = () => navigator.clipboard.writeText(output)
  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SQL Formatter</h1>
        <p className="text-gray-500 mb-8">Format and beautify SQL queries for better readability.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SQL Input</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SELECT * FROM users WHERE id = 1 AND status = 'active'"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={format} disabled={!input.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
              Format SQL
            </button>
            <button onClick={clear} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Clear
            </button>
          </div>
          {output && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formatted SQL</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm font-mono h-56 resize-none"
                readOnly value={output}
              />
              <button onClick={copy} className="mt-2 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Copy SQL
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
