'use client'
import { useState } from 'react'

function hexToHsl(hex: string): [number,number,number] {
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255
  const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6}
  return[Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}

function hslToHex(h: number,s: number,l: number): string {
  const hn=h/360,sn=s/100,ln=l/100
  const hue2rgb=(p:number,q:number,t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
  let r,g,b
  if(sn===0){r=g=b=ln}else{const q=ln<0.5?ln*(1+sn):ln+sn-ln*sn,p=2*ln-q;r=hue2rgb(p,q,hn+1/3);g=hue2rgb(p,q,hn);b=hue2rgb(p,q,hn-1/3)}
  return '#'+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase()
}

function generatePalette(base: string, type: string): Array<{hex:string,name:string}> {
  const [h,s,l]=hexToHsl(base)
  if(type==='monochromatic') {
    return [10,25,40,l,70,80,90].map((lt,i)=>({hex:hslToHex(h,s,lt),name:'Shade '+(i+1)}))
  }
  if(type==='complementary') {
    const comp=(h+180)%360
    return [hslToHex(h,s,l),hslToHex(h,s,Math.max(l-20,10)),hslToHex(comp,s,l),hslToHex(comp,s,Math.min(l+20,90)),hslToHex(h,s,90)].map((hex,i)=>({hex,name:['Base','Darker','Complement','Comp Light','Light'][i]}))
  }
  if(type==='triadic') {
    return [0,120,240].flatMap(offset=>{const nh=(h+offset)%360;return[{hex:hslToHex(nh,s,l),name:'Triad '+(offset/120+1)},{hex:hslToHex(nh,s,Math.min(l+20,90)),name:'Triad '+(offset/120+1)+' Light'}]})
  }
  if(type==='analogous') {
    return [-40,-20,0,20,40].map(offset=>({hex:hslToHex((h+offset+360)%360,s,l),name:offset===0?'Base':(offset>0?'+':'')+offset+'deg'}))
  }
  return [10,20,30,40,50,60,70,80,90].map((lt,i)=>({hex:hslToHex(h,s,lt),name:String((i+1)*100)}))
}

const TYPES=['monochromatic','complementary','triadic','analogous','shades'] as const

export default function ColorPaletteGenerator() {
  const [base,setBase]=useState('#3b82f6')
  const [type,setType]=useState<typeof TYPES[number]>('monochromatic')
  const [copied,setCopied]=useState('')

  const palette=generatePalette(base,type)
  const copy=async(hex:string)=>{await navigator.clipboard.writeText(hex);setCopied(hex);setTimeout(()=>setCopied(''),2000)}

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Palette Generator</h1>
        <p className="text-gray-500 mb-8">Generate beautiful color palettes from any base color — monochromatic, complementary, triadic, and more.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex gap-6 items-center flex-wrap mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-14 h-10 rounded-lg cursor-pointer border border-gray-300"/>
                <input type="text" value={base} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))setBase(e.target.value)}} className="w-28 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm uppercase focus:outline-none"/>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t=>(
              <button key={t} onClick={()=>setType(t)} className={'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize '+(type===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {palette.map((c,i)=>(
            <button key={i} onClick={()=>copy(c.hex)} className="group rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:scale-105 transition-transform">
              <div className="h-24" style={{backgroundColor:c.hex}}/>
              <div className="bg-white p-2.5">
                <p className="text-xs font-bold text-gray-700">{c.name}</p>
                <p className="font-mono text-xs text-gray-500">{c.hex}</p>
                <p className="text-xs text-blue-500 mt-0.5 opacity-0 group-hover:opacity-100">{copied===c.hex?'Copied!':'Click to copy'}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">CSS Variables</span>
            <button onClick={()=>copy(palette.map((c,i)=>'  --color-'+(i+1)+': '+c.hex+';').join('\n'))} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">Copy CSS</button>
          </div>
          <pre className="text-xs font-mono text-gray-600 bg-gray-50 rounded-xl p-3">{':root {\n'+palette.map((c,i)=>'  --color-'+(i+1)+': '+c.hex+';').join('\n')+'\n}'}</pre>
        </div>
      </div>
    </div>
  )
}