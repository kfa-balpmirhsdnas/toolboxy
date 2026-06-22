'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('font-pairing-tool')!
const PAIRINGS=[
  {heading:'Playfair Display',body:'Source Sans Pro',style:'elegant',preview:'Serif heading with clean sans-serif body — perfect for editorial and blog layouts.'},
  {heading:'Montserrat',body:'Merriweather',style:'modern',preview:'Bold geometric header paired with a readable serif — great for magazines.'},
  {heading:'Raleway',body:'Lato',style:'minimal',preview:'Thin elegant heading with a versatile body font — suits portfolios and landing pages.'},
  {heading:'Oswald',body:'Lora',style:'strong',preview:'Condensed bold headline contrasts beautifully with a literary serif body.'},
  {heading:'Nunito',body:'Open Sans',style:'friendly',preview:'Rounded heading and neutral body — ideal for apps and friendly interfaces.'},
  {heading:'Libre Baskerville',body:'Libre Franklin',style:'classic',preview:'Classic old-style serif heading with a modern humanist body — timeless.'},
  {heading:'Bebas Neue',body:'Roboto',style:'bold',preview:'Impactful all-caps heading with Google’s most popular sans-serif body font.'},
  {heading:'DM Serif Display',body:'DM Sans',style:'refined',preview:'DM family pairing — display serif header with matching geometric sans body.'},
]
const STYLES=['all','elegant','modern','minimal','strong','friendly','classic','bold','refined']
const SIZES={xs:12,sm:14,md:16,lg:18,xl:20}
const sampleText='The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.'
export default function FontPairingToolPage() {
  const [filter,setFilter]=useState('all')
  const [bg,setBg]=useState('#ffffff')
  const [fgH,setFgH]=useState('#111827')
  const [fgB,setFgB]=useState('#374151')
  const [bodySize,setBodySize]=useState(16)
  const [sampleBody,setSampleBody]=useState('Discover the perfect harmony of typefaces. Good typography elevates your design and guides the reader effortlessly through your content. Choose a pairing that matches your brand’s personality.')
  const filtered=filter==='all'?PAIRINGS:PAIRINGS.filter(p=>p.style===filter)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-1.5 items-center">
          {STYLES.map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              className={'px-3 py-1 rounded-full text-xs font-medium capitalize transition border '+(filter===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50 text-gray-600')}>
              {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-gray-500">Body size</label>
            <select value={bodySize} onChange={e=>setBodySize(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-1 text-xs">
              {Object.entries(SIZES).map(([k,v])=><option key={k} value={v}>{k} ({v}px)</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 items-center">
          <label>BG</label><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-8 h-6 rounded border border-gray-300 p-0.5 cursor-pointer"/>
          <label>Heading</label><input type="color" value={fgH} onChange={e=>setFgH(e.target.value)} className="w-8 h-6 rounded border border-gray-300 p-0.5 cursor-pointer"/>
          <label>Body</label><input type="color" value={fgB} onChange={e=>setFgB(e.target.value)} className="w-8 h-6 rounded border border-gray-300 p-0.5 cursor-pointer"/>
        </div>
        <div className="space-y-4">
          {filtered.map((p,i)=>(
            <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5" style={{background:bg}}>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <style>{'@import url('https://fonts.googleapis.com/css2?family='+encodeURIComponent(p.heading).replace(/%20/g,'+')+'&family='+encodeURIComponent(p.body).replace(/%20/g,'+')+'&display=swap')'}</style>
                <h2 className="text-3xl font-bold mb-3" style={{fontFamily:"'"+p.heading+"', serif",color:fgH,lineHeight:1.2}}>
                  {p.heading} + {p.body}
                </h2>
                <p className="leading-relaxed" style={{fontFamily:"'"+p.body+"', sans-serif",color:fgB,fontSize:bodySize+'px'}}>
                  {sampleBody}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 capitalize">{p.style}</span>
                  <span className="text-xs text-gray-500">{p.preview}</span>
                </div>
                <a href={'https://fonts.google.com/?query='+encodeURIComponent(p.heading)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-shrink-0">Google Fonts</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}