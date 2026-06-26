'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('image-to-base64')!
export default function ImageToBase64Page() {
  const t = useTranslations('toolui')
  const [dataUrl,setDataUrl]=useState('')
  const [fileName,setFileName]=useState('')
  const [fileSize,setFileSize]=useState(0)
  const [copied,setCopied]=useState<'dataUrl'|'base64'|''>('')
  const [tab,setTab]=useState<'dataUrl'|'base64'|'css'|'html'>('dataUrl')
  const fileRef=useRef<HTMLInputElement>(null)
  const handleFile=(file:File)=>{
    if(!file.type.startsWith('image/'))return
    setFileName(file.name);setFileSize(file.size)
    const reader=new FileReader()
    reader.onload=e=>setDataUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }
  const onInput=(e:React.ChangeEvent<HTMLInputElement>)=>{if(e.target.files?.[0])handleFile(e.target.files[0])}
  const onDrop=(e:React.DragEvent)=>{e.preventDefault();if(e.dataTransfer.files?.[0])handleFile(e.dataTransfer.files[0])}
  const base64=dataUrl?dataUrl.split(',')[1]:''
  const b64Size=base64?Math.round(base64.length*3/4):0
  const overhead=fileSize>0?Math.round((b64Size/fileSize-1)*100):0
  const outputs:{[k:string]:string}={
    dataUrl,
    base64,
    css: dataUrl?'background-image: url("'+dataUrl+'");':'',
    html: dataUrl?'<img src="'+dataUrl+'" alt="'+fileName+'" />':''
  }
  const copy=(k:typeof tab)=>{navigator.clipboard.writeText(outputs[k]);setCopied(k);setTimeout(()=>setCopied(''),1200)}
  const TABS=['dataUrl','base64','css','html'] as const
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
          onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInput}/>
          {dataUrl?(
            <img src={dataUrl} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain"/>
          ):(
            <div>
              <p className="text-4xl mb-2">🖼️</p>
              <p className="text-sm text-gray-500">{t('ati_drop')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('itb_formats')}</p>
            </div>
          )}
        </div>
        {dataUrl&&(
          <>
            <div className="flex gap-3 text-sm text-center">
              {[['itb_file',Math.round(fileSize/1024)+' KB'],['itb_base64',Math.round(b64Size/1024)+' KB'],['itb_overhead','+'+overhead+'%']].map(([l,v])=>(
                <div key={l} className="flex-1 bg-gray-50 rounded-xl py-2">
                  <p className="font-bold text-gray-800">{v}</p><p className="text-xs text-gray-500">{t(l)}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-1 mb-2">
                {TABS.map(tb=>(
                  <button key={tb} onClick={()=>setTab(tb)}
                    className={'px-3 py-1 rounded-lg text-xs font-medium transition '+(tab===tb?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {tb==='dataUrl'?t('itb_dataurl'):tb==='base64'?t('itb_base64only'):tb==='css'?'CSS':'HTML'}
                  </button>
                ))}
              </div>
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <button onClick={()=>copy(tab)}
                  className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  {copied===tab?t('ui_copied'):t('ui_copy')}
                </button>
                <pre className="px-4 py-8 text-green-400 font-mono text-xs overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{outputs[tab]}</pre>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}