'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('base64-image-viewer')!
const SAMPLE='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzNiODJmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkI2NDwvdGV4dD48L3N2Zz4='
export default function Base64ImageViewerPage() {
  const [input,setInput]=useState(SAMPLE)
  const [error,setError]=useState('')
  const [info,setInfo]=useState({width:0,height:0,type:''})
  const isDataUrl=input.startsWith('data:')
  const src=isDataUrl?input:(input.startsWith('/')||input.includes('+')||input.includes('=')?'data:image/png;base64,'+input.trim():'')
  const mimeMatch=input.match(/data:([^;]+);base64,/)
  const mimeType=mimeMatch?mimeMatch[1]:src?'image/png':''
  const b64=isDataUrl?input.split(',')[1]||'':input.trim()
  const b64Len=b64.replace(/=/g,'').length
  const approxBytes=Math.floor(b64Len*3/4)
  const onLoad=(e:React.SyntheticEvent<HTMLImageElement>)=>{
    const img=e.currentTarget
    setInfo({width:img.naturalWidth,height:img.naturalHeight,type:mimeType})
    setError('')
  }
  const onError=()=>setError('Invalid image data')
  const download=()=>{
    if(!src)return
    const a=document.createElement('a')
    a.href=src;a.download='image.'+mimeType.split('/')[1];a.click()
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Base64 or Data URL</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);setError('');setInfo({width:0,height:0,type:''})}} rows={5}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"
            placeholder="Paste Base64 string or data:image/... URL"/></div>
        <div className="flex gap-2 flex-wrap text-xs">
          <button onClick={()=>setInput(SAMPLE)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">Load sample</button>
          <button onClick={()=>setInput('')} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">Clear</button>
        </div>
        {src&&!error&&(
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <img src={src} alt="preview" onLoad={onLoad} onError={onError} className="max-w-full max-h-64 mx-auto rounded-lg object-contain shadow-sm"/>
            </div>
            {info.width>0&&(
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {[['Size',info.width+' × '+info.height+'px'],['Type',info.type||'unknown'],['~File size',approxBytes>1024?Math.round(approxBytes/1024)+' KB':approxBytes+' B']].map(([l,v])=>(
                  <div key={l} className="bg-gray-50 rounded-xl py-2">
                    <p className="font-bold text-gray-800 text-sm">{v}</p>
                    <p className="text-xs text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={download} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700">
              Download image
            </button>
          </div>
        )}
        {error&&<div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>}
      </div>
    </ToolLayout>
  )
}