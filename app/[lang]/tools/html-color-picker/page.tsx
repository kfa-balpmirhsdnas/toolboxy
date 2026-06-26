'use client'
import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('html-color-picker')!

function hexToRgb(hex: string): [number,number,number] {
  const clean = hex.replace('#','')
  const n = parseInt(clean,16)
  return [(n>>16)&255,(n>>8)&255,n&255]
}
function rgbToHsl(r:number,g:number,b:number):[number,number,number] {
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0; const l=(max+min)/2
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}h/=6}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}
function hexToHsv(hex:string):[number,number,number]{
  const [r,g,b]=hexToRgb(hex);const rf=r/255,gf=g/255,bf=b/255
  const max=Math.max(rf,gf,bf),min=Math.min(rf,gf,bf),d=max-min
  let h=0;if(d){if(max===rf)h=(gf-bf)/d%6;else if(max===gf)h=(bf-rf)/d+2;else h=(rf-gf)/d+4;h=Math.round(h*60);if(h<0)h+=360}
  return [h,max?Math.round(d/max*100):0,Math.round(max*100)]
}
function getLuminance(r:number,g:number,b:number):number{
  const toLinear=(c:number)=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)
  return 0.2126*toLinear(r/255)+0.7152*toLinear(g/255)+0.0722*toLinear(b/255)
}
function contrastRatio(l1:number,l2:number):number{const[a,b]=[Math.max(l1,l2),Math.min(l1,l2)];return (a+0.05)/(b+0.05)}

const NAMED: Record<string,string> = {
  aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',azure:'#f0ffff',
  beige:'#f5f5dc',bisque:'#ffe4c4',black:'#000000',blanchedalmond:'#ffebcd',blue:'#0000ff',
  blueviolet:'#8a2be2',brown:'#a52a2a',coral:'#ff7f50',cornflowerblue:'#6495ed',crimson:'#dc143c',
  cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',darkgray:'#a9a9a9',darkgreen:'#006400',
  deeppink:'#ff1493',deepskyblue:'#00bfff',dodgerblue:'#1e90ff',firebrick:'#b22222',forestgreen:'#228b22',
  gold:'#ffd700',goldenrod:'#daa520',gray:'#808080',green:'#008000',hotpink:'#ff69b4',
  indianred:'#cd5c5c',indigo:'#4b0082',khaki:'#f0e68c',lavender:'#e6e6fa',lawngreen:'#7cfc00',
  limegreen:'#32cd32',magenta:'#ff00ff',maroon:'#800000',midnightblue:'#191970',mintcream:'#f5fffa',
  navy:'#000080',olive:'#808000',orange:'#ffa500',orangered:'#ff4500',orchid:'#da70d6',
  pink:'#ffc0cb',plum:'#dda0dd',powderblue:'#b0e0e6',purple:'#800080',red:'#ff0000',
  salmon:'#fa8072',sandybrown:'#f4a460',seagreen:'#2e8b57',silver:'#c0c0c0',skyblue:'#87ceeb',
  slateblue:'#6a5acd',slategray:'#708090',snow:'#fffafa',springgreen:'#00ff7f',steelblue:'#4682b4',
  tan:'#d2b48c',teal:'#008080',thistle:'#d8bfd8',tomato:'#ff6347',turquoise:'#40e0d0',
  violet:'#ee82ee',white:'#ffffff',yellow:'#ffff00',yellowgreen:'#9acd32',
}

export default function HtmlColorPickerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [hex, setHex] = useState('#6366f1')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('html-color-picker'); tracked.current = true } }

  const safeHex = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#6366f1'
  const [r,g,b] = hexToRgb(safeHex)
  const [h,sl,l] = rgbToHsl(r,g,b)
  const [hv,s,v] = hexToHsv(safeHex)
  const lum = getLuminance(r,g,b)
  const whiteContrast = Math.round(contrastRatio(1,lum)*100)/100
  const blackContrast = Math.round(contrastRatio(0,lum)*100)/100

  async function copy(val:string,id:string) { await navigator.clipboard.writeText(val); trackToolCopy('html-color-picker'); setCopied(id); setTimeout(()=>setCopied(null),1500) }

  const filtered = Object.entries(NAMED).filter(([n])=>!search||n.includes(search.toLowerCase())).slice(0,60)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div>
            <input type="color" value={safeHex} onChange={e=>{setHex(e.target.value);track()}}
              className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0.5 bg-transparent" />
          </div>
          <div className="flex-1 space-y-2">
            <input value={hex} onChange={e=>{setHex(e.target.value);track()}} placeholder="#rrggbb"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 uppercase" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:'HEX', val:safeHex },
                { label:'RGB', val:`rgb(${r}, ${g}, ${b})` },
                { label:'HSL', val:`hsl(${h}, ${sl}%, ${l}%)` },
                { label:'HSV', val:`hsv(${hv}, ${s}%, ${v}%)` },
              ].map(({label,val})=>(
                <div key={label} onClick={()=>copy(val,label)}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-mono font-semibold">{val}</p>
                  {copied===label && <p className="text-xs text-brand-400">✓</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg text-center font-semibold" style={{background:safeHex,color:'white'}}>{t('hcp_white')} ({whiteContrast}:1)</div>
          <div className="p-2 rounded-lg text-center font-semibold" style={{background:safeHex,color:'black'}}>{t('hcp_black')} ({blackContrast}:1)</div>
        </div>
        <div>
          <input value={search} onChange={e=>{setSearch(e.target.value);track()}} placeholder={t('hcp_search')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-2" />
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto">
            {filtered.map(([name,hx])=>(
              <button key={name} onClick={()=>{setHex(hx);track();copy(hx,name)}}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{background:hx}} />
                <span className="text-xs text-gray-500 truncate w-full text-center">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
