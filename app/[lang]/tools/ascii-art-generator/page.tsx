'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('ascii-art-generator')!

// Bitmap font data for ASCII art (5x7 pixels per char)
const FONT: Record<string, number[][]> = {
  'A':[[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B':[[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C':[[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  'D':[[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E':[[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F':[[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G':[[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  'H':[[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J':[[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
  'K':[[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  'L':[[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'M':[[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N':[[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
  'O':[[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'P':[[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  'Q':[[0,1,0],[1,0,1],[1,0,1],[1,1,1],[0,1,1]],
  'R':[[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S':[[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  'T':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U':[[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'V':[[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
  'W':[[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
  'X':[[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y':[[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z':[[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  '0':[[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  '1':[[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2':[[0,1,0],[1,0,1],[0,0,1],[0,1,0],[1,1,1]],
  '3':[[1,1,0],[0,0,1],[0,1,0],[0,0,1],[1,1,0]],
  '4':[[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5':[[1,1,1],[1,0,0],[1,1,0],[0,0,1],[1,1,0]],
  '6':[[0,1,1],[1,0,0],[1,1,0],[1,0,1],[0,1,0]],
  '7':[[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8':[[0,1,0],[1,0,1],[0,1,0],[1,0,1],[0,1,0]],
  '9':[[0,1,0],[1,0,1],[0,1,1],[0,0,1],[0,1,0]],
  ' ':[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  '!':[[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  '?':[[0,1,0],[1,0,1],[0,0,1],[0,1,0],[0,0,0]],
  '.':[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
}

const CHARS = ['█','#','@','*','+','=','-','.']

function generateAsciiArt(text: string, fillChar: string, bgChar: string, scale: number): string {
  const chars = text.toUpperCase().split('').filter(c => FONT[c] !== undefined)
  if (!chars.length) return ''
  const height = 5
  const rows: string[][] = Array(height).fill(null).map(()=>[])
  for (const ch of chars) {
    const bitmap = FONT[ch] || FONT[' ']
    for (let row=0;row<height;row++) {
      bitmap[row].forEach(pixel=>{
        const cell = pixel ? fillChar.repeat(scale) : bgChar.repeat(scale)
        for (let s=0;s<scale;s++) rows[row].push(cell)
      })
      rows[row].push(bgChar) // letter spacing
    }
  }
  return rows.map(r=>r.join('')).join('\n')
}

export default function AsciiArtGeneratorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('HELLO')
  const [fillChar, setFillChar] = useState('█')
  const [bgChar, setBgChar] = useState(' ')
  const [scale, setScale] = useState(1)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('ascii-art-generator'); tracked.current = true } }

  const output = generateAsciiArt(input, fillChar, bgChar, scale)

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('ascii-art-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={input} onChange={e=>{setInput(e.target.value);track()}} maxLength={12}
          placeholder="Type text (A-Z, 0-9, max 12 chars)"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 uppercase" />
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill char</label>
            <div className="flex gap-1">
              {CHARS.map(c=>(
                <button key={c} onClick={()=>{setFillChar(c);track()}}
                  className={'w-8 h-8 rounded-lg font-mono text-sm transition-colors ' + (fillChar===c?'bg-brand-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scale: {scale}x</label>
            <input type="range" min={1} max={3} value={scale} onChange={e=>{setScale(parseInt(e.target.value));track()}} className="w-24 accent-brand-600" />
          </div>
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono leading-none overflow-x-auto">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
