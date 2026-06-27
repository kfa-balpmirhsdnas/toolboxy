'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('random-palette-generator')!
function hslToHex(h:number,s:number,l:number):string{
  l/=100;const a=s*Math.min(l,1-l)/100
  const f=(n:number)=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0')}
  return '#'+f(0)+f(8)+f(4)
}
function hexToRgb(hex:string){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}}
function getLum(hex:string){const{r,g,b}=hexToRgb(hex);return(0.299*r+0.587*g+0.114*b)/255}
type Scheme='random'|'analogous'|'complementary'|'triadic'|'monochromatic'|'pastel'
function genPalette(scheme:Scheme,count:number):string[]{
  const h=Math.random()*360,s=50+Math.random()*30,l=40+Math.random()*20
  if(scheme==='random')return Array.from({length:count},()=>hslToHex(Math.random()*360,40+Math.random()*40,35+Math.random()*30))
  if(scheme==='pastel')return Array.from({length:count},()=>hslToHex(Math.random()*360,60+Math.random()*20,75+Math.random()*10))
  if(scheme==='monochromatic')return Array.from({length:count},(_,i)=>hslToHex(h,s,20+i*(60/count)))
  if(scheme==='analogous')return Array.from({length:count},(_,i)=>hslToHex((h+i*30)%360,s,l))
  if(scheme==='complementary'){const c=[];for(let i=0;i<count;i++)c.push(hslToHex((h+(i%2===0?0:180))%360,s+i*3,l-i*4));return c}
  if(scheme==='triadic')return Array.from({length:count},(_,i)=>hslToHex((h+i*120)%360,s,l))
  return[]
}
export default function RandomPaletteGeneratorPage() {
  const t = useTranslations('toolui')
  const [scheme,setScheme]=useState<Scheme>('random')
  const [count,setCount]=useState(5)
  const [palette,setPalette]=useState(()=>genPalette('random',5))
  const [locked,setLocked]=useState<boolean[]>([false,false,false,false,false])
  const [copied,setCopied]=useState('')
  const gen=useCallback(()=>{
    const newPalette=genPalette(scheme,count)
    setPalette(p=>p.map((c,i)=>locked[i]?c:newPalette[i]||newPalette[0]))
  },[scheme,count,locked])
  const toggleLock=(i:number)=>setLocked(l=>{const n=[...l];n[i]=!n[i];return n})
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1000)}
  const copyAll=()=>{copy(palette.join(', '))}
  const SCHEMES:Scheme[]=['random','analogous','complementary','triadic','monochromatic','pastel']
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {SCHEMES.map(s=>(
            <button key={s} onClick={()=>setScheme(s)}
              className={'px-3 py-1.5 rounded-full border text-xs capitalize font-medium transition '+(scheme===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:bg-gray-50')}>{t('rpg_'+s)}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{t('rpg_colors')}</label>
          {[3,4,5,6].map(n=>(
            <button key={n} onClick={()=>{setCount(n);setLocked(Array(n).fill(false));setPalette(genPalette(scheme,n))}}
              className={'w-9 h-9 rounded-xl border font-bold text-sm transition '+(count===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{n}</button>
          ))}
          <button onClick={gen} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95">
            {t('ui_generate')}
          </button>
        </div>
        <div className="flex gap-2 h-48 rounded-2xl overflow-hidden">
          {palette.slice(0,count).map((color,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center justify-end pb-3 gap-1.5 cursor-pointer transition hover:flex-[1.5]" style={{backgroundColor:color}}>
              <button onClick={()=>toggleLock(i)}
                className="text-lg opacity-80 hover:opacity-100 transition" title={locked[i]?t('rpg_unlock'):t('rpg_lock')}>
                {locked[i]?'🔒':'🔓'}
              </button>
              <button onClick={()=>copy(color)}
                className={'px-2 py-1 rounded-lg text-xs font-mono font-bold transition '+(getLum(color)>0.5?'bg-black/10 text-gray-800 hover:bg-black/20':'bg-white/20 text-white hover:bg-white/30')}>
                {copied===color?'✓':color.toUpperCase()}
              </button>
            </div>
          ))}
        </div>
        <button onClick={copyAll} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          {copied===palette.join(', ')?t('ui_copied'):t('rpg_copyall')}
        </button>
      </div>
    </ToolLayout>
  )
}