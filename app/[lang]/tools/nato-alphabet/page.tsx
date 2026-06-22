'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const NATO: Record<string,string> = {
  A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',
  I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',
  Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',
  X:'X-ray',Y:'Yankee',Z:'Zulu',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four',
  '5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine'
}


const tool = getToolBySlug('nato-alphabet')!

export default function NatoAlphabetPage() {
  const [input, setInput] = useState('')

  const result = input.toUpperCase().split('').map(c => {
    if (c === ' ') return '[Space]'
    return NATO[c] || c
  }).join(' / ')

  const copy = () => navigator.clipboard.writeText(result)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NATO Phonetic Alphabet</h1>
        <p className="text-gray-500 mb-8">Convert text to NATO phonetic alphabet — Alpha, Bravo, Charlie...</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Hello World"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          {result && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NATO Phonetic</label>
              <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm leading-relaxed break-words select-all">
                {result}
              </div>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-700 mb-2 text-sm">Reference Table</h2>
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-600">
              {Object.entries(NATO).filter(([k]) => isNaN(Number(k))).map(([k,v]) => (
                <div key={k} className="flex gap-1"><span className="font-bold">{k}:</span>{v}</div>
              ))}
            </div>
          </div>
          <button onClick={copy} disabled={!result} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Copy Result
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
