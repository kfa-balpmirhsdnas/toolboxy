'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-box-model-visualizer')!

interface BoxValues { top:number; right:number; bottom:number; left:number }

function BoxInput({ label, values, onChange, color }: { label:string; values:BoxValues; onChange:(v:BoxValues)=>void; color:string }) {
  const t = useTranslations('toolui')
  function upd(side:keyof BoxValues, val:number) { onChange({...values,[side]:Math.max(0,val)}) }
  function all(val:number) { onChange({top:val,right:val,bottom:val,left:val}) }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold" style={{color}}>{t(label)}</label>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{t('bmv_all')}</span>
          <input type="number" min={0} max={200} defaultValue={0} onBlur={e=>all(parseInt(e.target.value)||0)}
            className="w-14 px-1.5 py-0.5 border border-gray-200 rounded-md text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-400" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(['top','right','bottom','left'] as (keyof BoxValues)[]).map(side=>(
          <div key={side}>
            <p className="text-xs text-gray-400 text-center mb-0.5">{t('bmv_'+side)}</p>
            <input type="number" min={0} max={200} value={values[side]} onChange={e=>upd(side,parseInt(e.target.value)||0)}
              className="w-full px-1.5 py-1.5 border border-gray-200 rounded-md text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CssBoxModelVisualizerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [margin, setMargin] = useState<BoxValues>({top:16,right:24,bottom:16,left:24})
  const [border, setBorder] = useState<BoxValues>({top:2,right:2,bottom:2,left:2})
  const [padding, setPadding] = useState<BoxValues>({top:12,right:16,bottom:12,left:16})
  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(60)
  const [boxSizing, setBoxSizing] = useState<'content-box'|'border-box'>('content-box')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('css-box-model-visualizer'); tracked.current = true } }

  const css = `.element {
  width: ${width}px;
  height: ${height}px;
  box-sizing: ${boxSizing};
  margin: ${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px;
  border: ${border.top}px solid #6366f1;
  padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px;
}`

  async function copy() { await navigator.clipboard.writeText(css); trackToolCopy('css-box-model-visualizer'); setCopied(true); setTimeout(()=>setCopied(false),1500) }

  const contentW = boxSizing==='border-box' ? Math.max(0,width-border.left-border.right-padding.left-padding.right) : width
  const contentH = boxSizing==='border-box' ? Math.max(0,height-border.top-border.bottom-padding.top-padding.bottom) : height
  const totalW = (boxSizing==='border-box'?width:width+border.left+border.right+padding.left+padding.right)+margin.left+margin.right
  const totalH = (boxSizing==='border-box'?height:height+border.top+border.bottom+padding.top+padding.bottom)+margin.top+margin.bottom

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('ui_width')} (px)</label>
                <input type="number" min={20} max={400} value={width} onChange={e=>{setWidth(parseInt(e.target.value)||20);track()}}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('ui_height')} (px)</label>
                <input type="number" min={20} max={400} value={height} onChange={e=>{setHeight(parseInt(e.target.value)||20);track()}}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">box-sizing</label>
              <div className="flex gap-1">
                {(['content-box','border-box'] as const).map(v=>(
                  <button key={v} onClick={()=>{setBoxSizing(v);track()}}
                    className={'px-3 py-1.5 rounded-lg text-xs transition-colors ' + (boxSizing===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <BoxInput label="bmv_margin" values={margin} onChange={v=>{setMargin(v);track()}} color="#f59e0b" />
            <BoxInput label="bmv_border" values={border} onChange={v=>{setBorder(v);track()}} color="#6366f1" />
            <BoxInput label="bmv_padding" values={padding} onChange={v=>{setPadding(v);track()}} color="#10b981" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center min-h-48 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden p-4">
              <div className="relative flex items-center justify-center text-xs text-center"
                style={{background:'#fef3c7',padding:`${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`}}>
                <span className="absolute top-0.5 left-1 text-yellow-600 font-bold" style={{fontSize:9}}>margin</span>
                <div style={{background:'#c7d2fe',padding:`${border.top}px ${border.right}px ${border.bottom}px ${border.left}px`}}>
                  <div style={{background:'#d1fae5',padding:`${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`}}>
                    <div className="bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 font-medium"
                      style={{width:Math.max(20,contentW)+'px',height:Math.max(20,contentH)+'px',fontSize:10}}>
                      content
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('bmv_totalw')}</span> <span className="font-bold">{totalW}px</span></div>
              <div className="p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('bmv_totalh')}</span> <span className="font-bold">{totalH}px</span></div>
              <div className="p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('bmv_contentw')}</span> <span className="font-bold">{contentW}px</span></div>
              <div className="p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('bmv_contenth')}</span> <span className="font-bold">{contentH}px</span></div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
