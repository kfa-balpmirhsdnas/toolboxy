'use client'
import { useState } from 'react'

type Base = 2|8|10|16
const BASES: {base:Base;label:string;prefix:string}[] = [
  {base:2,  label:'Binary (Base 2)',      prefix:'0b'},
  {base:8,  label:'Octal (Base 8)',        prefix:'0o'},
  {base:10, label:'Decimal (Base 10)',     prefix:''},
  {base:16, label:'Hexadecimal (Base 16)', prefix:'0x'},
]

function isValidForBase(s:string,b:Base){
  const clean=s.toUpperCase()
  if(b===2) return /^[01]*$/.test(clean)
  if(b===8) return /^[0-7]*$/.test(clean)
  if(b===10) return /^[0-9]*$/.test(clean)
  return /^[0-9A-F]*$/.test(clean)
}

export default function NumberBaseConverterPage() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState<Base>(10)
  const [error, setError] = useState('')

  function handleInput(val:string) {
    const clean = val.trim().toUpperCase()
    setInput(clean)
    if(clean&&!isValidForBase(clean,fromBase)) setError('Invalid characters for '+fromBase+'-base')
    else setError('')
  }

  const decimal = (!error&&input) ? parseInt(input,fromBase) : NaN
  const valid = !isNaN(decimal) && decimal >= 0

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number Base Converter</h1>
        <p className="text-gray-500 mb-8">Convert numbers between binary, octal, decimal and hexadecimal</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Base</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BASES.map(b=>(
                <button key={b.base} onClick={()=>{setFromBase(b.base);setInput('');setError('')}}
                  className={'px-2 py-2 rounded-lg text-sm font-medium transition-colors text-center '+(fromBase===b.base?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  Base {b.base}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter {BASES.find(b=>b.base===fromBase)?.label}
            </label>
            <input value={input} onChange={e=>handleInput(e.target.value)}
              placeholder={fromBase===16?'e.g. 1A3F':fromBase===2?'e.g. 1010':fromBase===8?'e.g. 755':'e.g. 255'}
              className={'w-full border rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:ring-2 '+(error?'border-red-400 focus:ring-red-400':'border-gray-300 focus:ring-brand-500')} />
            {error&&<p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>
        {valid&&(
          <div className="mt-6 space-y-3">
            {BASES.map(b=>(
              <div key={b.base} className={'flex items-center justify-between px-5 py-4 rounded-xl border-2 '+(b.base===fromBase?'border-brand-200 bg-brand-50':'border-gray-100 bg-white')}>
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase mb-1">{b.label}</div>
                  <div className={'font-mono text-xl font-bold '+(b.base===fromBase?'text-brand-600':'text-gray-800')}>
                    {b.prefix}{decimal.toString(b.base).toUpperCase()}
                  </div>
                </div>
                <button onClick={()=>navigator.clipboard.writeText(decimal.toString(b.base).toUpperCase())}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}