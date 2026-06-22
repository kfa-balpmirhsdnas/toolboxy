'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function caesar(text: string, shift: number, decrypt: boolean): string {
  const n = decrypt ? (26 - (shift % 26)) % 26 : shift % 26
  return text.split('').map(ch => {
    if (/[a-z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 97 + n) % 26) + 97)
    if (/[A-Z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 65 + n) % 26) + 65)
    return ch
  }).join('')
}

function bruteForce(text: string) {
  return Array.from({length: 26}, (_, i) => ({
    shift: i + 1,
    result: caesar(text, i + 1, false)
  }))
}


const tool = getToolBySlug('caesar-cipher')!

export default function CaesarCipher() {
  const [input, setInput] = useState('Hello World')
  const [shift, setShift] = useState(3)
  const [mode, setMode] = useState<'encrypt'|'decrypt'|'brute'>('encrypt')
  const [copied, setCopied] = useState(false)
  const output = mode === 'brute' ? '' : caesar(input, shift, mode === 'decrypt')
  const bruteResults = mode === 'brute' ? bruteForce(input) : []
  const copy = async (t: string) => { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Caesar Cipher</h1>
        <p className="text-gray-500 mb-8">Encrypt or decrypt text with the classic Caesar cipher shift.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['encrypt','decrypt','brute'] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode===m?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m==='encrypt'?'🔒 Encrypt':m==='decrypt'?'🔓 Decrypt':'🔍 Brute Force'}
              </button>
            ))}
          </div>
          {mode !== 'brute' && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shift: <span className="text-blue-600">{shift}</span></label>
              <input type="range" min="1" max="25" value={shift} onChange={e=>setShift(Number(e.target.value))} className="w-full accent-blue-600"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>25</span></div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Input</label>
              <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full border border-gray-300 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} placeholder="Enter text..."/>
            </div>
            {mode !== 'brute' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Output</label>
                  <button onClick={()=>copy(output)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">{copied?'✓ Copied!':'Copy'}</button>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 font-mono text-sm min-h-[90px] text-gray-800 whitespace-pre-wrap">{output||<span className="text-gray-400">Output will appear here...</span>}</div>
              </div>
            )}
            {mode === 'brute' && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">All 25 possible decryptions:</p>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {bruteResults.map(({shift:s,result})=>(
                    <div key={s} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={()=>copy(result)}>
                      <span className="text-xs font-bold text-blue-600 w-12 shrink-0 pt-0.5">ROT-{s}</span>
                      <span className="font-mono text-sm text-gray-700">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
          <strong>About Caesar Cipher:</strong> A substitution cipher that shifts each letter by a fixed number of positions in the alphabet. ROT-13 (shift=13) is its own inverse.
        </div>
      </div>
    </div>
  )
}