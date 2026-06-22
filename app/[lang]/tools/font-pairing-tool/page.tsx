'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('font-pairing-tool')!

const PAIRS = [
  { heading:'Playfair Display', body:'Source Sans Pro',    style:'serif+sans',    mood:'Elegant' },
  { heading:'Montserrat',        body:'Merriweather',      style:'sans+serif',    mood:'Modern Classic' },
  { heading:'Oswald',            body:'Lato',              style:'sans+sans',     mood:'Bold Clean' },
  { heading:'Raleway',           body:'Raleway',           style:'sans+sans',     mood:'Minimal' },
  { heading:'Playfair Display',  body:'Raleway',           style:'serif+sans',    mood:'Editorial' },
  { heading:'Roboto Slab',       body:'Roboto',            style:'serif+sans',    mood:'Tech Friendly' },
  { heading:'Abril Fatface',     body:'Lato',              style:'display+sans',  mood:'Bold Statement' },
  { heading:'Libre Baskerville', body:'Libre Baskerville', style:'serif+serif',   mood:'Literary' },
  { heading:'Josefin Sans',      body:'Josefin Sans',      style:'sans+sans',     mood:'Geometric' },
  { heading:'Nunito',            body:'Nunito',            style:'rounded+rounded',mood:'Friendly' },
  { heading:'Bebas Neue',        body:'Open Sans',         style:'display+sans',  mood:'Impact' },
  { heading:'Crimson Text',      body:'Work Sans',         style:'serif+sans',    mood:'Refined' },
]

const SAMPLE_TEXTS = [
  { heading:'The quick brown fox', body:'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.' },
  { heading:'Design Matters', body:'Good design is not just what looks good. It also needs to perform, engages, surprises and makes life better.' },
  { heading:'Hello World', body:'This is a sample paragraph to demonstrate how the font pairing looks in practice. Typography sets the tone of your content.' },
]

export default function FontPairingToolPage({ params }: { params: { lang: string } }) {
  const [pairIdx, setPairIdx] = useState(0)
  const [sampleIdx, setSampleIdx] = useState(0)
  const [fontSize, setFontSize] = useState(20)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('font-pairing-tool'); tracked.current = true } }

  const pair = PAIRS[pairIdx]
  const sample = SAMPLE_TEXTS[sampleIdx]
  const hFont = pair.heading.replace(/ /g,'+')
  const bFont = pair.body.replace(/ /g,'+')
  const googleUrl = `https://fonts.googleapis.com/css2?family=${hFont}:wght@700&family=${bFont}&display=swap`

  const css = `/* Google Fonts import */
@import url('${googleUrl}');

h1, h2, h3 {
  font-family: '${pair.heading}', serif;
  font-weight: 700;
}

body, p {
  font-family: '${pair.body}', sans-serif;
}`

  async function copy() {
    await navigator.clipboard.writeText(css)
    trackToolCopy('font-pairing-tool')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <link href={googleUrl} rel="stylesheet" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAIRS.map((p,i)=>(
            <button key={i} onClick={()=>{setPairIdx(i);track()}}
              className={'p-2 rounded-xl border text-left transition-all ' + (pairIdx===i?'border-brand-400 bg-brand-50':'border-gray-200 hover:border-gray-300')}>
              <p className="text-xs text-gray-500">{p.mood}</p>
              <p className="text-xs font-medium truncate">{p.heading}</p>
              <p className="text-xs text-gray-400 truncate">{p.body}</p>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {SAMPLE_TEXTS.map((s,i)=>(
            <button key={i} onClick={()=>{setSampleIdx(i);track()}}
              className={'px-3 py-1.5 rounded-lg text-xs transition-colors ' + (sampleIdx===i?'bg-gray-700 text-white':'bg-gray-100 text-gray-600')}>
              Sample {i+1}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto text-xs text-gray-600">
            <span>Size: {fontSize}px</span>
            <input type="range" min={12} max={36} value={fontSize} onChange={e=>{setFontSize(parseInt(e.target.value));track()}} className="w-24 accent-brand-600" />
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h2 style={{fontFamily:"'"+pair.heading+"', serif", fontSize:fontSize*1.8+'px', fontWeight:700, lineHeight:1.2, marginBottom:'0.5em'}}>
            {sample.heading}
          </h2>
          <p style={{fontFamily:"'"+pair.body+"', sans-serif", fontSize:fontSize+'px', lineHeight:1.7, color:'#374151'}}>
            {sample.body}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Heading: <span className="font-semibold text-gray-600">{pair.heading}</span> &nbsp;·&nbsp;
            Body: <span className="font-semibold text-gray-600">{pair.body}</span> &nbsp;·&nbsp;
            <span className="text-brand-600">{pair.mood}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS Import</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
