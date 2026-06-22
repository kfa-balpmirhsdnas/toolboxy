'use client'
import { useState } from 'react'

const FLIP_MAP: Record<string,string> = {
  'a':'É','b':'q','c':'É','d':'p','e':'Ç','f':'É','g':'Æ','h':'É¥','i':'Ä±',
  'j':'É¾','k':'Ê','l':'l','m':'w','n':'u','o':'o','p':'d','q':'b','r':'É¹','s':'s',
  't':'Ê','u':'n','v':'Ê','w':'m','x':'x','y':'Ê','z':'z',
  'A':'â','B':'áº','C':'Æ','D':'á¡','E':'Æ','F':'â²','G':'â','H':'H',
  'I':'I','J':'á','K':'â','L':'J','M':'W','N':'N','O':'O','P':'Ô','Q':'Ô',
  'R':'á´','S':'S','T':'â¥','U':'â©','V':'â§','W':'M','X':'X','Y':'â','Z':'Z',
  '0':'0','1':'Æ','2':'Æ»','3':'Æ','4':'á­','5':'5','6':'9','7':'â±¢','8':'8','9':'6',
  '.':'Ë',',':'â','?':'Â¿','!':'Â¡',''':',','"':'â','(':')',')':'(','[':']',']':'[',
  ' ':' '
};

export default function FlipTextPage() {
  const [input, setInput] = useState('')
  
  const flipped = input.split('').map(c => FLIP_MAP[c] || c).reverse().join('')
  
  const copy = () => navigator.clipboard.writeText(flipped)

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flip Text Upside Down</h1>
        <p className="text-gray-500 mb-8">Convert your text to upside-down unicode characters instantly.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type something to flip..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flipped Text</label>
            <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm h-32 overflow-auto break-all select-all">
              {flipped || <span className="text-gray-400">Flipped text appears here...</span>}
            </div>
          </div>
          <button
            onClick={copy}
            disabled={!flipped}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Copy Flipped Text
          </button>
        </div>
      </div>
    </main>
  )
}
