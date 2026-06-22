'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('csv-viewer')!

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    const row: string[] = []
    let inQuote = false, cell = ''
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"' && !inQuote) { inQuote = true }
      else if (c === '"' && inQuote && line[i+1] === '"') { cell += '"'; i++ }
      else if (c === '"' && inQuote) { inQuote = false }
      else if (c === ',' && !inQuote) { row.push(cell); cell = '' }
      else { cell += c }
    }
    row.push(cell)
    rows.push(row)
  }
  return rows
}

export default function CsvViewerPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [rows, setRows] = useState<string[][]>([])
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)
  const tracked = useRef(false)

  function process(csv: string) {
    setText(csv)
    if (!tracked.current) { trackToolUsed('csv-viewer'); tracked.current = true }
    setRows(parseCsv(csv))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) { const reader = new FileReader(); reader.onload = ev => process(ev.target?.result as string); reader.readAsText(file) }
  }, [])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const reader = new FileReader(); reader.onload = ev => process(ev.target?.result as string); reader.readAsText(file) }
  }

  const headers = rows[0] || []
  const dataRows = rows.slice(1)
  const filtered = search
    ? dataRows.filter(row => row.some(cell => cell.toLowerCase().includes(search.toLowerCase())))
    : dataRows

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!text && (
          <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
            className={'border-2 border-dashed rounded-2xl p-10 text-center transition-colors ' + (dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-300 bg-gray-50')}>
            <p className="text-gray-500 mb-3">Drag & drop a CSV file or paste below</p>
            <label className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg cursor-pointer hover:bg-brand-700 transition-colors">
              Browse File <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
            </label>
          </div>
        )}
        <textarea
          value={text}
          onChange={e => process(e.target.value)}
          placeholder="Or paste CSV text here..."
          rows={text ? 3 : 4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {rows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rows..."
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <span className="text-xs text-gray-500">{filtered.length} / {dataRows.length} rows</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 w-8">#</th>
                    {headers.map((h,i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0,200).map((row, ri) => (
                    <tr key={ri} className={ri%2===0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5 text-gray-400">{ri+1}</td>
                      {headers.map((_,ci) => (
                        <td key={ci} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-xs truncate">{row[ci]||''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 200 && (
                <p className="p-3 text-center text-xs text-gray-400">Showing first 200 rows of {filtered.length}</p>
              )}
            </div>
            <button onClick={() => { setText(''); setRows([]); setSearch('') }}
              className="text-xs text-red-500 hover:underline">Clear</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
