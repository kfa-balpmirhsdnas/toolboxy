'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-name-finder')!
const NAMED_COLORS:{name:string;hex:string}[]=[
  {name:'Red',hex:'#ff0000'},{name:'Green',hex:'#008000'},{name:'Blue',hex:'#0000ff'},{name:'White',hex:'#ffffff'},{name:'Black',hex:'#000000'},
  {name:'Yellow',hex:'#ffff00'},{name:'Cyan',hex:'#00ffff'},{name:'Magenta',hex:'#ff00ff'},{name:'Orange',hex:'#ffa500'},{name:'Purple',hex:'#800080'},
  {name:'Pink',hex:'#ffc0cb'},{name:'Brown',hex:'#a52a2a'},{name:'Gray',hex:'#808080'},{name:'Silver',hex:'#c0c0c0'},{name:'Gold',hex:'#ffd700'},
  {name:'Maroon',hex:'#800000'},{name:'Olive',hex:'#808000'},{name:'Teal',hex:'#008080'},{name:'Navy',hex:'#000080'},{name:'Coral',hex:'#ff7f50'},
  {name:'Salmon',hex:'#fa8072'},{name:'Khaki',hex:'#f0e68c'},{name:'Indigo',hex:'#4b0082'},{name:'Violet',hex:'#ee82ee'},{name:'Crimson',hex:'#dc143c'},
  {name:'Turquoise',hex:'#40e0d0'},{name:'Lime',hex:'#00ff00'},{name:'Aqua',hex:'#00ffff'},{name:'Beige',hex:'#f5f5dc'},{name:'Ivory',hex:'#fffff0'},
  {name:'Lavender',hex:'#e6e6fa'},{name:'Mint',hex:'#98ff98'},{name:'Peach',hex:'#ffcba4'},{name:'Plum',hex:'#dda0dd'},{name:'Tan',hex:'#d2b48c'},
  {name:'Sky Blue',hex:'#87ceeb'},{name:'Forest Green',hex:'#228b22'},{name:'Hot Pink',hex:'#ff69b4'},{name:'Slate Blue',hex:'#6a5acd'},{name:'Tomato',hex:'#ff6347'},
]
function hexToRgb(h:string):[number,number,number]{
  const r=h.replace('#','')
  return [parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)]
}
function colorDist(a:string,b:string):number{
  const [r1,g1,b1]=hexToRgb(a),[r2,g2,b2]=hexToRgb(b)
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2)
}
function findClosest(hex:string,n:number):{name:string;hex:string;dist:number}[]{
  return NAMED_COLORS.map(c=>({...c,dist:colorDist(hex,c.hex)})).sort((a,b)=>a.dist-b.dist).slice(0,n)
}
function isLight(hex:string):boolean{
  const [r,g,b]=hexToRgb(hex)
  return (0.299*r+0.587*g+0.114*b)>128
}
export default function ColorNameFinderPage() {
  const t = useTranslations('toolui')
  const [color,setColor]=useState('#3b82f6')
  const [hex,setHex]=useState('#3b82f6')
  const closest=findClosest(hex,5)
  const [r,g,b]=hexToRgb(hex)
  const textCol=isLight(hex)?'#1f2937':'#f9fafb'
  const updateHex=(v:string)=>{
    setHex(v)
    if(/^#[0-9a-fA-F]{6}$/.test(v))setColor(v)
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex gap-3">
          <input type="color" value={color} onChange={e=>{setColor(e.target.value);setHex(e.target.value)}} className="w-14 h-11 rounded border border-gray-300 cursor-pointer p-0.5"/>
          <input value={hex} onChange={e=>updateHex(e.target.value)} placeholder="#3b82f6" className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono uppercase"/>
        </div>
        <div className="rounded-xl p-6 text-center transition-all" style={{background:color}}>
          <p className="text-4xl font-bold mb-1" style={{color:textCol}}>{closest[0]?.name}</p>
          <p className="text-sm font-mono" style={{color:textCol,opacity:0.7}}>{hex.toUpperCase()} · rgb({r},{g},{b})</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t('cnf_closest')}</p>
          <div className="space-y-2">
            {closest.map((c,i)=>(
              <div key={c.name} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-200" style={{background:c.hex}}/>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs font-mono text-gray-500">{c.hex.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  {i===0&&<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t('cnf_best')}</span>}
                  <p className="text-xs text-gray-400 mt-0.5">{t('cnf_dist')}: {Math.round(c.dist)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}