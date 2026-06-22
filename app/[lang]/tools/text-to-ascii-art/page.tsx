'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-ascii-art')!
const CHARS:Record<string,string[]>={
  A:['  #  ','# #  ','###  ','#  # ','#  # '],
  B:['###  ','#  # ','###  ','#  # ','###  '],
  C:[' ### ','#    ','#    ','#    ',' ### '],
  D:['###  ','#  # ','#  # ','#  # ','###  '],
  E:['#### ','#    ','###  ','#    ','#### '],
  F:['#### ','#    ','###  ','#    ','#    '],
  G:[' ### ','#    ','# ## ','#  # ',' ### '],
  H:['#  # ','#  # ','#### ','#  # ','#  # '],
  I:[' ### ','  #  ','  #  ','  #  ',' ### '],
  J:['  ## ','   # ','   # ','#  # ',' ##  '],
  K:['#  # ','# #  ','##   ','# #  ','#  # '],
  L:['#    ','#    ','#    ','#    ','#### '],
  M:['#   #','## ##','# # #','#   #','#   #'],
  N:['#  # ','## # ','# ## ','#  # ','#  # '],
  O:[' ### ','#   #','#   #','#   #',' ### '],
  P:['###  ','#  # ','###  ','#    ','#    '],
  Q:[' ### ','#   #','#   #','# ## ',' ###.'],
  R:['###  ','#  # ','###  ','# #  ','#  # '],
  S:[' ### ','#    ',' ##  ','   # ',' ### '],
  T:['#####','  #  ','  #  ','  #  ','  #  '],
  U:['#   #','#   #','#   #','#   #',' ### '],
  V:['#   #','#   #',' # # ',' # # ','  #  '],
  W:['#   #','#   #','# # #','## ##','#   #'],
  X:['#   #',' # # ','  #  ',' # # ','#   #'],
  Y:['#   #',' # # ','  #  ','  #  ','  #  '],
  Z:['#####','   # ','  #  ',' #   ','#####'],
  ' ':['     ','     ','     ','     ','     '],
  '!':['  #  ','  #  ','  #  ','     ','  #  '],
  '?':['#### ','   # ',' ##  ','     ','  #  '],
  '0':[' ### ','#  ##','# # #','##  #',' ### '],
  '1':['  #  ',' ##  ','  #  ','  #  ','##### '],
  '2':[' ### ','#   #','  ## ',' #   ','#### '],
  '3':['#### ','   # ',' ##  ','   # ','#### '],
}
export default function TextToAsciiArtPage() {
  const [text,setText]=useState('HELLO')
  const [char,setChar]=useState('#')
  const [spacing,setSpacing]=useState(1)
  const [copied,setCopied]=useState(false)
  const upper=text.toUpperCase()
  const lines:string[]=Array(5).fill('')
  for(const c of upper){
    const glyph=CHARS[c]||CHARS['?']
    for(let i=0;i<5;i++){lines[i]+=glyph[i].replace(/#/g,char)+' '.repeat(spacing)}
  }
  const art=lines.join('
')
  const copy=()=>{navigator.clipboard.writeText(art);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <input value={text} onChange={e=>setText(e.target.value.slice(0,15))} className="w-full rounded border border-gray-300 px-3 py-2.5" placeholder="HELLO" maxLength={15}/></div>
          <div className="w-20"><label className="block text-sm font-medium text-gray-700 mb-1">Char</label>
            <input value={char} onChange={e=>setChar(e.target.value.slice(-1)||'#')} className="w-full rounded border border-gray-300 px-3 py-2.5 text-center text-xl font-bold" maxLength={1}/></div>
          <div className="w-24"><label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
            <select value={spacing} onChange={e=>setSpacing(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-2.5">
              {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">ASCII Art</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-4 text-green-400 font-mono text-sm overflow-x-auto leading-relaxed">{art}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}