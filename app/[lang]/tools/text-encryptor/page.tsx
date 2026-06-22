'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-encryptor')!

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

function caesar(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base)
  })
}

function atbash(text: string): string {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base))
  })
}

function vigenere(text: string, key: string, decrypt = false): string {
  if (!key) return text
  const k = key.toLowerCase().replace(/[^a-z]/g,'')
  if (!k) return text
  let ki = 0
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    const shift = k.charCodeAt(ki % k.length) - 97
    ki++
    const s = decrypt ? (26 - shift) : shift
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base)
  })
}

const METHODS = ['ROT13','Caesar','Atbash','Vigenère'] as const
type Method = typeof METHODS[number]

export default function TextEncryptorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog')
  const [method, setMethod] = useState<Method>('ROT13')
  const [shift, setShift] = useState(13)
  const [key, setKey] = useState('secret')
  const [mode, setMode] = useState<'encrypt'|'decrypt'>('encrypt')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-encryptor'); tracked.current = true } }

  const output = (() => {
    if (!input) return ''
    if (method === 'ROT13') return rot13(input)
    if (method === 'Caesar') return mode==='encrypt' ? caesar(input, shift) : caesar(input, 26-shift)
    if (method === 'Atbash') return atbash(input)
    return vigenere(input, key, mode==='decrypt')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-encryptor')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {METHODS.map(m=>(
            <button key={m} onClick={()=>{setMethod(m);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (method===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m}
            </button>
          ))}
          {method!=='ROT13'&&method!=='Atbash' && (
            <div className="flex gap-2 items-center ml-auto">
              {(['encrypt','decrypt'] as const).map(md=>(
                <button key={md} onClick={()=>{setMode(md);track()}}
                  className={'px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ' + (mode===md?'bg-gray-700 text-white':'bg-gray-100 text-gray-600')}>
                  {md}
                </button>
              ))}
            </div>
          )}
        </div>
        {method==='Caesar' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600">Shift</label>
            <input type="range" min={1} max={25} value={shift} onChange={e=>{setShift(parseInt(e.target.value));track()}} className="flex-1 accent-brand-600" />
            <span className="text-sm font-mono w-6 text-center">{shift}</span>
          </div>
        )}
        {method==='Vigenère' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key</label>
            <input value={key} onChange={e=>{setKey(e.target.value);track()}} placeholder="Enter keyword"
              className="w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        )}
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={4} placeholder="Enter text..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono break-all">{output}</div>
          </div>
        )}
        <p className="text-xs text-gray-400">Note: These are classical ciphers for fun and education, not cryptographically secure.</p>
      </div>
    </ToolLayout>
  )
}
