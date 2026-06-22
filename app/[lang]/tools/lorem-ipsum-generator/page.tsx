'use client'
import { useState } from 'react'

const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum']

function randomWord(exclude='') {
  let w; do { w=WORDS[Math.floor(Math.random()*WORDS.length)] } while(w===exclude)
  return w
}

function generateSentence(): string {
  const len = 6 + Math.floor(Math.random()*12)
  const words = Array.from({length:len},(_,i)=>i===0?randomWord().charAt(0).toUpperCase()+randomWord().slice(1):randomWord())
  return words.join(' ')+'.'
}

function generateParagraph(): string {
  const count = 4 + Math.floor(Math.random()*4)
  return Array.from({length:count},generateSentence).join(' ')
}

function generateClassic(): string {
  return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
}

export default function LoremIpsumGenerator() {
  const [type,setType]=useState<'paragraphs'|'sentences'|'words'>('paragraphs')
  const [count,setCount]=useState(3)
  const [startWithLorem,setStartWithLorem]=useState(true)
  const [output,setOutput]=useState('')
  const [copied,setCopied]=useState(false)

  const generate = () => {
    let result = ''
    if(type==='paragraphs') {
      const paras = Array.from({length:count},(_,i)=>i===0&&startWithLorem?generateClassic():generateParagraph())
      result = paras.join('\n\n')
    } else if(type==='sentences') {
      const sents = Array.from({length:count},(_,i)=>i===0&&startWithLorem?'Lorem ipsum dolor sit amet, consectetur adipiscing elit.':generateSentence())
      result = sents.join(' ')
    } else {
      const words = Array.from({length:count},(_,i)=>i===0&&startWithLorem?'Lorem':randomWord())
      result = words.join(' ')
    }
    setOutput(result)
  }

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lorem Ipsum Generator</h1>
        <p className="text-gray-500 mb-8">Generate placeholder Latin text for your designs and mockups.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Generate</label>
              <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Count</label>
              <input type="number" value={count} onChange={e=>setCount(Math.max(1,Math.min(20,parseInt(e.target.value)||1)))} min="1" max="20" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={startWithLorem} onChange={e=>setStartWithLorem(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
                <span className="text-sm text-gray-700">Start with "Lorem ipsum"</span>
              </label>
            </div>
          </div>
          <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
            Generate
          </button>
        </div>
        {output && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Generated Text</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{output.split(' ').length} words</span>
                <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">{copied?'✓ Copied!':'Copy'}</button>
              </div>
            </div>
            <div className="p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{output}</div>
          </div>
        )}
      </div>
    </div>
  )
}