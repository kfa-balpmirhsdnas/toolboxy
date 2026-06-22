'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('base64-image-encoder')!

export default function Base64ImageEncoderPage() {
  const [dataUrl,setDataUrl]=useState('')
  const [fileName,setFileName]=useState('')
  const [fileSize,setFileSize]=useState(0)
  const [copied,setCopied]=useState<'url'|'css'|'html'|null>(null)
  const fileRef=useRef<HTMLInputElement>(null)

  function handleFile(file:File){
    setFileName(file.name)
    setFileSize(file.size)
    const reader=new FileReader()
    reader.onload=e=>setDataUrl(e.target?.result as string||'')
    reader.readAsDataURL(file)
  }

  function copy(type:'url'|'css'|'html',text:string){
    navigator.clipboard.writeText(text)
    setCopied(type);setTimeout(()=>setCopied(null),1500)
  }

  const base64Only=dataUrl.split(',')[1]||''
  const mimeType=dataUrl.split(';')[0].replace('data:','')||'image/png'
  const encodedSize=base64Only.length

  const snippets=dataUrl?[
    {key:'url' as const,label:'Data URL',value:dataUrl},
    {key:'html' as const,label:'HTML <img>',value:`<img src="${dataUrl}" alt="${fileName}" />`},
    {key:'css' as const,label:'CSS background',value:`background-image: url('${dataUrl}');`},
  ]:[]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Base64 Image Encoder</h1>
        <p className="text-gray-500 mb-8">Convert images to Base64 Data URLs for use in HTML, CSS, and JSON</p>
        <div
          className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-400 p-10 text-center cursor-pointer transition-colors"
          onClick={()=>fileRef.current?.click()}
          onDragOver={e=>{e.preventDefault()}}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))handleFile(f)}}>
          <div className="text-4xl mb-3">🖼️</div>
          {dataUrl?(
            <div>
              <img src={dataUrl} alt={fileName} className="max-h-40 mx-auto rounded-lg mb-2 object-contain" />
              <p className="text-sm text-gray-600">{fileName} · {(fileSize/1024).toFixed(1)} KB input · {(encodedSize/1024).toFixed(1)} KB encoded</p>
            </div>
          ):(
            <div>
              <p className="text-gray-600 font-medium">Drop an image here or click to upload</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF, SVG, WebP</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}} />
        </div>
        {snippets.length>0&&(
          <div className="mt-4 space-y-3">
            {snippets.map(s=>(
              <div key={s.key} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                  <button onClick={()=>copy(s.key,s.value)} className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">{copied===s.key?'\u2713':'Copy'}</button>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-600 break-all max-h-20 overflow-auto">{s.value.slice(0,200)+'...'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}