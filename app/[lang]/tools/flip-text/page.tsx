'use client'
import { useState } from 'react'

const FLIP_MAP: Record<string,string> = {
  'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ı',
  'j':'ɾ','k':'ʞ','l':'l','m':'w','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s',
  't':'ʇ','u':'n','v':'ʌ','w':'m','x':'x','y':'ʎ','z':'z',
  'A':'∀','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'⅁','H':'H',
  'I':'I','J':'ᒋ','K':'⋊','L':'J','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Ԁ',
  'R':'ᴚ','S':'S','T':'⊥','U':'∩','V':'∧','W':'M','X':'X','Y':'⅄','Z':'Z',
  '0':'0','1':'Ɩ','2':'ƻ','3':'Ɛ','4':'ᔭ','5':'5','6':'9','7':'Ɫ','8':'8','9':'6',
  '.':'˙',',':'‘','?':'¿','!':'¡',''':',','"':'„','(':')',')'+'(':'','[':']',']':'[',
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
