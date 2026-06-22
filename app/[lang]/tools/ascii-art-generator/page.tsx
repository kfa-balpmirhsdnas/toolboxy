'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const FONTS: Record<string, Record<string, string[]>> = {
  block: {
    A:['  ###  ',' ## ## ','##   ##','#######','##   ##'],
    B:['###### ','##   ##','###### ','##   ##','###### '],
    C:[' ######','##     ','##     ','##     ',' ######'],
    D:['##### ','##  ##','##  ##','##  ##','##### '],
    E:['######','##    ','##### ','##    ','######'],
    F:['######','##    ','##### ','##    ','##    '],
    G:[' #####','##    ','## ###','##  ##',' #####'],
    H:['##  ##','##  ##','######','##  ##','##  ##'],
    I:['######','  ##  ','  ##  ','  ##  ','######'],
    J:['######','   ## ','   ## ','##  ## ','  ##  '],
    K:['##  ##','## ## ','####  ','## ## ','##  ##'],
    L:['##    ','##    ','##    ','##    ','######'],
    M:['##   ##','###  ##','## # ##','##  ###','##   ##'],
    N:['##   ##','###  ##','## # ##','##  ###','##   ##'],
    O:[' ##### ','##   ##','##   ##','##   ##',' ##### '],
    P:['###### ','##   ##','###### ','##     ','##     '],
    Q:[' ##### ','##   ##','##  ###','##   ##',' ###### '],
    R:['###### ','##   ##','###### ','## ##  ','##  ## '],
    S:[' ######','##     ',' ##### ','     ##','###### '],
    T:['######','  ##  ','  ##  ','  ##  ','  ##  '],
    U:['##  ##','##  ##','##  ##','##  ##',' #### '],
    V:['##   ##','##   ##','##   ##',' ## ## ','  ###  '],
    W:['##   ##','##   ##','## # ##','###  ##','##   ##'],
    X:['##   ##',' ## ## ','  ###  ',' ## ## ','##   ##'],
    Y:['##   ##',' ## ## ','  ###  ','  ##  ','  ##  '],
    Z:['######','   ## ','  ##  ',' ##   ','######'],
    ' ':['  ','  ','  ','  ','  '],
    '0':[' ### ','## ##','## ##','## ##',' ### '],
    '1':['  # ',' ## ','  # ','  # ',' ### '],
    '2':[' ### ','##  #',' ##  ','##   ','#####'],
    '3':['####','    #','####','    #','####'],
    '4':['## ##','## ##','#####','   ##','   ##'],
    '5':['#####','##   ','#### ','   ##','#### '],
    '6':[' ### ','##   ','#### ','## ##',' ### '],
    '7':['#####','   ##','  ## ','  ## ','  ## '],
    '8':[' ### ','## ##',' ### ','## ##',' ### '],
    '9':[' ### ','## ##',' ####','   ##',' ### '],
  }
}

function generateAscii(text: string, char: string = '#'): string {
  const font = FONTS.block
  const upper = text.toUpperCase().slice(0, 15)
  const rows = 5
  const lines: string[] = Array(rows).fill('')
  for(const ch of upper) {
    const glyph = font[ch] || font[' ']
    for(let r=0;r<rows;r++) {
      lines[r] += (glyph[r] || '   ').replace(/#/g, char) + ' '
    }
  }
  return lines.join('\n')
}

const CHARS = ['#','@','*','█','▓','░','♦','✦','•','■']


const tool = getToolBySlug('ascii-art-generator')!

export default function AsciiArtGenerator() {
  const [text,setText]=useState('HELLO')
  const [char,setChar]=useState('#')
  const [customChar,setCustomChar]=useState('')
  const [copied,setCopied]=useState(false)

  const activeChar=customChar||char
  const output=generateAscii(text,activeChar)
  const copy=async()=>{await navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ASCII Art Generator</h1>
        <p className="text-gray-500 mb-8">Turn text into large ASCII art letters. Works great in terminals, readmes, and banners.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Text (max 15 characters)</label>
          <input type="text" value={text} onChange={e=>setText(e.target.value.toUpperCase().slice(0,15))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="HELLO"/>
          <div className="flex gap-3 items-center flex-wrap">
            <label className="text-sm font-semibold text-gray-700">Character:</label>
            <div className="flex gap-2 flex-wrap">
              {CHARS.map(c=>(
                <button key={c} onClick={()=>{setChar(c);setCustomChar('')}}
                  className={`w-9 h-9 rounded-lg text-lg font-mono transition-colors ${char===c&&!customChar?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  {c}
                </button>
              ))}
            </div>
            <input type="text" maxLength={1} value={customChar} onChange={e=>setCustomChar(e.target.value)} placeholder="?" className="w-12 h-9 text-center border border-gray-300 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-300">Output</span>
            <button onClick={copy} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg font-medium">{copied?'✓ Copied!':'Copy'}</button>
          </div>
          <pre className="text-green-400 font-mono text-sm leading-tight overflow-x-auto whitespace-pre">{output||'Type something above...'}</pre>
        </div>
      </div>
    </div>
  )
}