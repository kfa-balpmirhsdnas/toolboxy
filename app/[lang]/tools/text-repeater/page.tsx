'use client'
import { useState } from 'react'

export default function TextRepeaterPage() {
  const [text, setText] = useState('')
  const [count, setCount] = useState(3)
  const [separator, setSeparator] = useState('\n')
  const [sepLabel, setSepLabel] = useState('newline')

  const SEP_OPTIONS = [
    { label: 'Newline', value: '\n' },
    { label: 'Space', value: ' ' },
    { label: 'Comma', value: ', ' },
    { label: 'None', value: '' },
  ]

  const result = text ? Array(Math.min(count, 500)).fill(text).join(separator) : ''
  const copy = () => navigator.clipboard.writeText(result)

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Repeater</h1>
        <p className="text-gray-500 mb-8">Repeat any text a specified number of times with a custom separator.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text to Repeat</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to repeat..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Count</label>
              <input type="number" min="1" max="500"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={count} onChange={e => setCount(Math.min(500, Math.max(1, +e.target.value)))} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sepLabel}
                onChange={e => { setSepLabel(e.target.value); setSeparator(SEP_OPTIONS.find(o => o.label === e.target.value)?.value ?? '') }}>
                {SEP_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {result && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result <span className="text-gray-400 font-normal">({count} repetitions)</span>
                </label>
                <textarea className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm h-40 resize-none font-mono" readOnly value={result} />
              </div>
              <button onClick={copy} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy Result
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
