'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-rotate')!

function mirrorH(text: string): string {
  const MIRROR: Record<string,string> = {'a':'ɐ','b':'q','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','y':'ʎ','z':'z','A':'∀','C':'Ɔ','E':'Ǝ','F':'Ⅎ','L':'⅂','M':'W','T':'ʇ','W':'M','Y':'⅄','.':'˙',',':''','\'':'‚','?':'¿','!':'¡','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'L','8':'8','9':'6','0':'0','(':')',')'':'(','[':']',']':'[','{':'}','}':'{','<':'>','>':'<','&':'⅋','_':'‾'}
  return text.split('').reverse().map(c=>MIRROR[c.toLowerCase()]||MIRROR[c]||c).join('')
}
function reverseChars(text: string): string { return text.split('').reverse().join('') }
function reverseWords(text: string): string { return text.split(' ').reverse().join(' ') }
function reverseLines(text: string): string { return text.split('\n').reverse().join('\n') }
function rotateLeft(text: string): string { return text.slice(1)+text.charAt(0) }
function rotateRight(text: string): string { return text.charAt(text.length-1)+text.slice(0,-1) }
function zalgo(text: string): string {
  const UP=['\u0300','\u0301','\u0302','\u0306','\u030C','\u0308','\u0310','\u031A']
  const MID=['\u0315','\u031B','\u0329','\u032C']
  const DOWN=['\u0316','\u0317','\u031E','\u031F','\u0330','\u0331','\u0332','\u0334']
  return text.split('').map(c=>{
    if (c===' '||c==='\n') return c
    let r=c
    for(let i=0;i<3;i++) r+=UP[Math.floor(Math.random()*UP.length)]
    for(let i=0;i<2;i++) r+=MID[Math.floor(Math.random()*MID.length)]
    for(let i=0;i<3;i++) r+=DOWN[Math.floor(Math.random()*DOWN.length)]
    return r
  }).join('')
}

const TRANSFORMS = [
  { id:'flip-upside-down', label:'Flip Upside Down', fn:mirrorH },
  { id:'mirror', label:'Mirror (RTL)', fn:reverseChars },
  { id:'reverse-words', label:'Reverse Words', fn:reverseWords },
  { id:'reverse-lines', label:'Reverse Lines', fn:reverseLines },
  { id:'rotate-left', label:'Rotate Left (chars)', fn:rotateLeft },
  { id:'rotate-right', label:'Rotate Right (chars)', fn:rotateRight },
  { id:'zalgo', label:'Zalgo Text', fn:zalgo },
]

export default function TextRotatePage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('Hello World!')
  const [mode, setMode] = useState('flip-upside-down')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('text-rotate'); tracked.current = true } }

  const fn = TRANSFORMS.find(t=>t.id===mode)?.fn || (x=>x)
  const output = input ? fn(input) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-rotate')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={3} placeholder="Enter text..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="flex flex-wrap gap-2">
          {TRANSFORMS.map(t=>(
            <button key={t.id} onClick={()=>{setMode(t.id);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (mode===t.id?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t.label}
            </button>
          ))}
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Result</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg break-all">{output}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
