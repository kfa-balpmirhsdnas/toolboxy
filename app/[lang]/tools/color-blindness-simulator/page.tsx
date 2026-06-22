'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('color-blindness-simulator')!

type SimType = 'normal'|'protanopia'|'deuteranopia'|'tritanopia'|'achromatopsia'|'protanomaly'|'deuteranomaly'

const SIM_INFO: Record<SimType,{label:string;desc:string}> = {
  normal:        { label:'Normal',         desc:'Standard color vision' },
  protanopia:    { label:'Protanopia',     desc:'Red-blind (~1% of males)' },
  deuteranopia:  { label:'Deuteranopia',   desc:'Green-blind (~1% of males)' },
  tritanopia:    { label:'Tritanopia',     desc:'Blue-blind (rare)' },
  achromatopsia: { label:'Achromatopsia',  desc:'Total color blindness (very rare)' },
  protanomaly:   { label:'Protanomaly',    desc:'Red-weak (~1% of males)' },
  deuteranomaly: { label:'Deuteranomaly',  desc:'Green-weak (~5% of males)' },
}

// Simplified simulation matrices (LMS-based approximations)
function applyMatrix(r:number,g:number,b:number,m:number[]): [number,number,number] {
  const nr=Math.min(255,Math.max(0,m[0]*r+m[1]*g+m[2]*b))
  const ng=Math.min(255,Math.max(0,m[3]*r+m[4]*g+m[5]*b))
  const nb=Math.min(255,Math.max(0,m[6]*r+m[7]*g+m[8]*b))
  return [nr,ng,nb]
}

const MATRICES: Record<SimType,number[]> = {
  normal:        [1,0,0, 0,1,0, 0,0,1],
  protanopia:    [0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
  deuteranopia:  [0.625,0.375,0, 0.7,0.3,0, 0,0.3,0.7],
  tritanopia:    [0.95,0.05,0, 0,0.433,0.567, 0,0.475,0.525],
  achromatopsia: [0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114],
  protanomaly:   [0.817,0.183,0, 0.333,0.667,0, 0,0.125,0.875],
  deuteranomaly: [0.8,0.2,0, 0.258,0.742,0, 0,0.142,0.858],
}

function simulateImageData(src: ImageData, type: SimType): ImageData {
  const dst = new ImageData(src.width, src.height)
  const m = MATRICES[type]
  for (let i=0;i<src.data.length;i+=4) {
    const [nr,ng,nb] = applyMatrix(src.data[i],src.data[i+1],src.data[i+2],m)
    dst.data[i]=nr; dst.data[i+1]=ng; dst.data[i+2]=nb; dst.data[i+3]=src.data[i+3]
  }
  return dst
}

export default function ColorBlindnessSimulatorPage({ params }: { params: { lang: string } }) {
  const [simType, setSimType] = useState<SimType>('protanopia')
  const [origUrl, setOrigUrl] = useState('')
  const [simUrl, setSimUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('color-blindness-simulator'); tracked.current = true } }

  const processImage = useCallback((file: File, type: SimType) => {
    track()
    setProcessing(true)
    const img = new Image()
    const url = URL.createObjectURL(file)
    setOrigUrl(url)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width=img.width; canvas.height=img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img,0,0)
      const id = ctx.getImageData(0,0,img.width,img.height)
      const sim = simulateImageData(id, type)
      ctx.putImageData(sim,0,0)
      setSimUrl(canvas.toDataURL())
      setProcessing(false)
    }
    img.src=url
  }, [])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) processImage(f, simType)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f?.type.startsWith('image/')) processImage(f, simType)
  }

  function changeType(t: SimType) {
    setSimType(t)
    if (origUrl) {
      // re-process with current blob
      fetch(origUrl).then(r=>r.blob()).then(b=>processImage(new File([b],'img'),t))
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SIM_INFO) as SimType[]).map(t=>(
            <button key={t} onClick={()=>changeType(t)}
              className={'px-3 py-1.5 rounded-lg text-xs transition-colors ' + (simType===t?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {SIM_INFO[t].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{SIM_INFO[simType].desc}</p>
        {!origUrl ? (
          <label onDrop={onDrop} onDragOver={e=>e.preventDefault()}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-brand-400 transition-colors">
            <span className="text-3xl mb-2">🖼️</span>
            <span className="text-sm text-gray-600">Drop an image or click to upload</span>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1 text-center">Original</p>
              <img src={origUrl} alt="original" className="w-full rounded-xl border border-gray-200 object-contain max-h-64" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1 text-center">{SIM_INFO[simType].label}</p>
              {processing ? (
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-400">Processing...</span>
                </div>
              ) : simUrl ? (
                <img src={simUrl} alt="simulated" className="w-full rounded-xl border border-gray-200 object-contain max-h-64" />
              ) : null}
            </div>
          </div>
        )}
        {origUrl && (
          <button onClick={()=>{setOrigUrl('');setSimUrl('')}} className="text-xs text-gray-400 hover:text-gray-600">
            ✕ Remove image
          </button>
        )}
      </div>
    </ToolLayout>
  )
}
