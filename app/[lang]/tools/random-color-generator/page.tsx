'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('random-color-generator')!
function randHex():string{return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}
function hexToRgb(h:string):[number,number,number]{const r=h.replace('#','');return [parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)]}
function rgbToHsl(r:number,g:number,b:number):[number,number,number]{
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>0.5?d/(2-max-min):d/(max+min)
    if(max===r)h=(g-b)/d+(g<b?6:0)
    else if(max===g)h=(b-r)/d+2
    else h=(r-g)/d+4
    h/=6
  }
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}
function isLight(h:string):boolean{const [r,g,b]=hexToRgb(h);return (0.299*r+0.587*g+0.114*b)>128}
export default function RandomColorGeneratorPage() {
  const [colors,setColors]=useState<string[]>(()=>Array.from({length:8},randHex))
  const [locked,setLocked]=useState<boolean[]>(Array(8).fill(false))
  const [copied,setCopied]=useState('')
  const [count,setCount]=useState(8)
  const generate=useCallback(()=>{
    setColors(c=>c.map((col,i)=>locked[i]?col:randHex()))
  },[locked])
  const resize=(n:number)=>{
    setCount(n)
    setColors(c=>n>c.length?[...c,...Array.from({length:n-c.length},randHex)]:c.slice(0,n))
    setLocked(l=>n>l.length?[...l,...Array(n-l.length).fill(false)]:l.slice(0,n))
  }
  const toggleLock=(i:number)=>setLocked(l=>{const n=[...l];n[i]=!n[i];return n})
  const copy=(h:string)=>{navigator.clipboard.writeText(h);setCopied(h);setTimeout(()=>setCopied(''),1500)}
  const copyAll=()=>{navigator.clipboard.writeText(colors.join('\n'));setCopied('all');setTimeout(()=>setCopied(''),1500)}\n  return (\n    <ToolLayout tool={tool}>\n      <div className="max-w-2xl mx-auto px-4 space-y-4">\n        <div className="flex gap-3 items-center flex-wrap">\n          <button onClick={generate} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Generate Colors</button>\n          <div className="flex items-center gap-2 text-sm">\n            <span className="text-gray-600">Count:</span>\n            {[4,6,8,10,12].map(n=>(\n              <button key={n} onClick={()=>resize(n)}\n                className={'w-9 h-9 rounded-lg border font-medium transition '+(count===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{n}</button>\n            ))}\n          </div>\n          <button onClick={copyAll} className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">{copied==='all'?'Copied!':'Copy All'}</button>\n        </div>\n        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">\n          {colors.slice(0,count).map((c,i)=>{\n            const [r,g,b]=hexToRgb(c)\n            const [h,s,l]=rgbToHsl(r,g,b)\n            const light=isLight(c)\n            return (\n              <div key={i} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">\n                <div className="h-24 flex items-center justify-center relative" style={{background:c}}>\n                  <button onClick={()=>toggleLock(i)}\n                    className={'absolute top-2 right-2 text-base transition '+(locked[i]?'opacity-100':'opacity-40 hover:opacity-80')}\n                    title={locked[i]?'Unlock':'Lock'} style={{color:light?'#374151':'#f9fafb'}}>\n                    {locked[i]?'🔒':'🔓'}\n                  </button>\n                </div>\n                <div className="p-2 bg-white">\n                  <p className="font-mono text-xs font-bold text-gray-800 text-center">{c.toUpperCase()}</p>\n                  <p className="text-xs text-gray-500 text-center">rgb({r},{g},{b})</p>\n                  <p className="text-xs text-gray-400 text-center">hsl({h},{s}%,{l}%)</p>\n                  <button onClick={()=>copy(c)} className="w-full mt-1.5 text-xs py-1 bg-gray-50 rounded hover:bg-gray-100">{copied===c?'Copied!':'Copy hex'}</button>\n                </div>\n              </div>\n            )\n          })}\n        </div>\n        <p className="text-xs text-gray-400 text-center">Click the lock icon to keep a color while regenerating</p>\n      </div>\n    </ToolLayout>\n  )\n}