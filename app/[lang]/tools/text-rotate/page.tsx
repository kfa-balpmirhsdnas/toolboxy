'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('text-rotate')!

const MIRROR: Record<string, string> = {
  a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ı',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',
  n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
  A:'∀',B:'B',C:'Ɔ',D:'D',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ɾ',K:'K',L:'˥',M:'W',
  N:'N',O:'O',P:'Ԁ',Q:'Q',R:'R',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ᔭ','5':'ϛ','6':'9','7':'L','8':'8','9':'6',
  '.':'˙',',':'ʽ','?':'¿','!':'¡',
  '(':')',')':'(','[':']',']':'[','{':'}','}':'{',
  '_':'‾','&':'⅋','<':'>','>':'<'
}

const reverseChars = (t: string) => t.split('').reverse().join('')
const mirrorH = (t: string) => t.split('').reverse().map(c => MIRROR[c.toLowerCase()] || MIRROR[c] || c).join('')

export default function TextRotatePage() {
  const [input, setInput] = useState('Hello World')
  const [mode, setMode] = useState<'reverse'|'flip'>('flip')

  const output = mode === 'flip' ? mirrorH(input) : reverseChars(input)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-3 mb-2">
          {(['flip', 'reverse'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={['px-4 py-2 rounded text-sm font-medium', mode === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'].join(' ')}>
              {m === 'flip' ? 'Flip Upside Down' : 'Reverse'}
            </button>
          ))}
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm h-28" placeholder="Enter text..." />
        <div className="bg-gray-50 border rounded p-4">
          <p className="text-xs text-gray-500 mb-1">Output</p>
          <p className="font-mono text-lg break-all">{output}</p>
        </div>
        <button onClick={() => navigator.clipboard.writeText(output)}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">
          Copy Output
        </button>
      </div>
    </ToolLayout>
  )
}