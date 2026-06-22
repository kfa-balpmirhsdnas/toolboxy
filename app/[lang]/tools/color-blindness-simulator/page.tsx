'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-blindness-simulator')!
const TYPES=[
  {id:'normal',label:'Normal Vision',desc:'Full color perception'},
  {id:'deuteranopia',label:'Deuteranopia',desc:'Green-blind (most common, 1% males)'},
  {id:'protanopia',label:'Protanopia',desc:'Red-blind (1% males)'},
  {id:'tritanopia',label:'Tritanopia',desc:'Blue-blind (rare, 0.001%)'},
  {id:'achromatopsia',label:'Achromatopsia',desc:'Complete color blindness (very rare)'},
]
function rgbToSim(r:number,g:number,b:number,type:string):[number,number,number]{
  if(type==='normal')return[r,g,b]
  if(type==='achromatopsia'){const y=Math.round(0.299*r+0.587*g+0.114*b);return[y,y,y]}
  if(type==='deuteranopia')return[Math.min(255,Math.round(0.625*r+0.375*b)),Math.min(255,Math.round(0.7*r+0.3*b)),Math.min(255,Math.round(0.3*g+0.7*b))]
  if(type==='protanopia')return[Math.min(255,Math.round(0.567*g+0.433*b)),Math.min(255,Math.round(0.558*g+0.442*b)),Math.min(255,Math.round(0.242*g+0.758*b))]
  if(type==='tritanopia')return[Math.min(255,Math.round(0.95*r+0.05*g)),Math.min(255,Math.round(0.433*r+0.567*g)),Math.min(255,Math.round(0.475*r+0.525*g))]
  return[r,g,b]
}
function hexToRgb(h:string):[number,number,number]{const r=h.replace('#','');return[parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)]}
function rgbToHex(r:number,g:number,b:number):string{return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}
const PALETTE=['#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#FF8800','#8800FF','#00FF88','#FF0088','#88FF00','#0088FF','#FF4444','#44FF44','#4444FF']
export default function ColorBlindnessSimulatorPage() {
  const [selected,setSelected]=useState('deuteranopia')
  const [customColor,setCustomColor]=useState('#3b82f6')
  const [r,g,b]=hexToRgb(customColor)
  const [sr,sg,sb]=rgbToSim(r,g,b,selected)
  const simHex=rgbToHex(sr,sg,sb)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="space-y-2">
          {TYPES.map(t=>(
            <button key={t.id} onClick={()=>setSelected(t.id)}
              className={'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition '+(selected===t.id?'bg-blue-50 border-blue-300':'border-gray-200 hover:bg-gray-50')}>
              <div className={'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 '+(selected===t.id?'bg-blue-600 border-blue-600':'border-gray-400')}/>
              <div><p className="text-sm font-medium text-gray-800">{t.label}</p><p className="text-xs text-gray-500">{t.desc}</p></div>
            </button>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Test a color</p>
          <div className="flex gap-3 items-center mb-3">
            <input type="color" value={customColor} onChange={e=>setCustomColor(e.target.value)} className="w-12 h-12 rounded border border-gray-300 cursor-pointer p-0.5"/>
            <div className="flex-1 flex gap-3">
              <div className="flex-1 text-center">
                <div className="h-16 rounded-xl border border-gray-200" style={{background:customColor}}/>
                <p className="text-xs text-gray-500 mt-1">Original</p>
                <p className="text-xs font-mono text-gray-700">{customColor.toUpperCase()}</p>
              </div>
              <div className="flex-1 text-center">
                <div className="h-16 rounded-xl border border-gray-200" style={{background:simHex}}/>
                <p className="text-xs text-gray-500 mt-1">{TYPES.find(t=>t.id===selected)?.label}</p>
                <p className="text-xs font-mono text-gray-700">{simHex.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Color palette simulation</p>
          <div className="grid grid-cols-5 gap-2">
            {PALETTE.map(c=>{
              const [pr,pg,pb]=hexToRgb(c)
              const [sr2,sg2,sb2]=rgbToSim(pr,pg,pb,selected)
              const sh=rgbToHex(sr2,sg2,sb2)
              return (
                <div key={c} className="text-center">
                  <div className="h-10 rounded-lg border border-gray-200 mb-0.5" style={{background:c}}/>
                  <div className="h-10 rounded-lg border border-gray-200" style={{background:sh}}/>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Top: original — Bottom: simulated</p>
        </div>
      </div>
    </ToolLayout>
  )
}