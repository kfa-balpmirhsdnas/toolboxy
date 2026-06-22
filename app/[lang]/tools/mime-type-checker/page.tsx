'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('mime-type-checker')!

const MIME_DB: Record<string,{mime:string,category:string,desc:string}> = {
  jpg:  {mime:'image/jpeg',     category:'Image',    desc:'JPEG Image'},
  jpeg: {mime:'image/jpeg',     category:'Image',    desc:'JPEG Image'},
  png:  {mime:'image/png',      category:'Image',    desc:'PNG Image'},
  gif:  {mime:'image/gif',      category:'Image',    desc:'GIF Image'},
  webp: {mime:'image/webp',     category:'Image',    desc:'WebP Image'},
  svg:  {mime:'image/svg+xml',  category:'Image',    desc:'SVG Vector Image'},
  ico:  {mime:'image/x-icon',   category:'Image',    desc:'Icon File'},
  avif: {mime:'image/avif',     category:'Image',    desc:'AVIF Image'},
  bmp:  {mime:'image/bmp',      category:'Image',    desc:'Bitmap Image'},
  tiff: {mime:'image/tiff',     category:'Image',    desc:'TIFF Image'},
  pdf:  {mime:'application/pdf',category:'Document', desc:'PDF Document'},
  doc:  {mime:'application/msword',category:'Document',desc:'Word Document (Legacy)'},
  docx: {mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',category:'Document',desc:'Word Document'},
  xls:  {mime:'application/vnd.ms-excel',category:'Spreadsheet',desc:'Excel Spreadsheet (Legacy)'},
  xlsx: {mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',category:'Spreadsheet',desc:'Excel Spreadsheet'},
  ppt:  {mime:'application/vnd.ms-powerpoint',category:'Presentation',desc:'PowerPoint (Legacy)'},
  pptx: {mime:'application/vnd.openxmlformats-officedocument.presentationml.presentation',category:'Presentation',desc:'PowerPoint'},
  mp3:  {mime:'audio/mpeg',     category:'Audio',    desc:'MP3 Audio'},
  wav:  {mime:'audio/wav',      category:'Audio',    desc:'WAV Audio'},
  ogg:  {mime:'audio/ogg',      category:'Audio',    desc:'OGG Audio'},
  flac: {mime:'audio/flac',     category:'Audio',    desc:'FLAC Audio'},
  aac:  {mime:'audio/aac',      category:'Audio',    desc:'AAC Audio'},
  mp4:  {mime:'video/mp4',      category:'Video',    desc:'MP4 Video'},
  webm: {mime:'video/webm',     category:'Video',    desc:'WebM Video'},
  avi:  {mime:'video/x-msvideo',category:'Video',    desc:'AVI Video'},
  mov:  {mime:'video/quicktime',category:'Video',    desc:'QuickTime Video'},
  mkv:  {mime:'video/x-matroska',category:'Video',  desc:'Matroska Video'},
  html: {mime:'text/html',      category:'Text',     desc:'HTML Document'},
  css:  {mime:'text/css',       category:'Text',     desc:'CSS Stylesheet'},
  js:   {mime:'text/javascript',category:'Text',     desc:'JavaScript'},
  ts:   {mime:'text/typescript',category:'Text',     desc:'TypeScript'},
  json: {mime:'application/json',category:'Data',   desc:'JSON Data'},
  xml:  {mime:'application/xml',category:'Data',    desc:'XML Data'},
  csv:  {mime:'text/csv',       category:'Data',     desc:'CSV Spreadsheet'},
  txt:  {mime:'text/plain',     category:'Text',     desc:'Plain Text'},
  md:   {mime:'text/markdown',  category:'Text',     desc:'Markdown'},
  zip:  {mime:'application/zip',category:'Archive',  desc:'ZIP Archive'},
  gz:   {mime:'application/gzip',category:'Archive', desc:'Gzip Archive'},
  tar:  {mime:'application/x-tar',category:'Archive',desc:'TAR Archive'},
  wasm: {mime:'application/wasm',category:'Binary',  desc:'WebAssembly'},
  woff: {mime:'font/woff',      category:'Font',     desc:'Web Open Font Format'},
  woff2:{mime:'font/woff2',     category:'Font',     desc:'Web Open Font Format 2'},
  ttf:  {mime:'font/ttf',       category:'Font',     desc:'TrueType Font'},
  otf:  {mime:'font/otf',       category:'Font',     desc:'OpenType Font'},
}

const CATEGORY_COLORS: Record<string,string> = {
  Image:'bg-blue-100 text-blue-700', Document:'bg-red-100 text-red-700',
  Spreadsheet:'bg-green-100 text-green-700', Presentation:'bg-orange-100 text-orange-700',
  Audio:'bg-purple-100 text-purple-700', Video:'bg-pink-100 text-pink-700',
  Text:'bg-gray-100 text-gray-700', Data:'bg-yellow-100 text-yellow-700',
  Archive:'bg-amber-100 text-amber-700', Binary:'bg-indigo-100 text-indigo-700',
  Font:'bg-cyan-100 text-cyan-700',
}

export default function MimeTypeCheckerPage({ params }: { params: { lang: string } }) {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('mime-type-checker'); tracked.current = true } }

  const q = query.trim().toLowerCase().replace(/^\./,'')
  const exactMatch = q ? MIME_DB[q] : null
  const similar = q ? Object.entries(MIME_DB).filter(([ext])=>ext.includes(q)&&ext!==q).slice(0,8) : []
  
  // also search by mime type
  const mimeMatches = q.includes('/') 
    ? Object.entries(MIME_DB).filter(([,v])=>v.mime.includes(q)).slice(0,10)
    : []

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('mime-type-checker')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={query} onChange={e=>{setQuery(e.target.value);track()}} placeholder="Extension (e.g. pdf) or MIME type (e.g. image/png)"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        
        {exactMatch && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (CATEGORY_COLORS[exactMatch.category]||'bg-gray-100 text-gray-700')}>{exactMatch.category}</span>
              <span className="text-sm font-medium text-gray-800">{exactMatch.desc}</span>
            </div>
            <div onClick={()=>copy(exactMatch.mime,'mime')} className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-100 cursor-pointer hover:border-brand-300">
              <span className="text-sm font-mono text-brand-700">{exactMatch.mime}</span>
              <span className="text-xs text-brand-400">{copied==='mime'?'\u2713':'Copy'}</span>
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Similar extensions</p>
            {similar.map(([ext,info])=>(
              <div key={ext} onClick={()=>copy(info.mime,ext)} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-brand-300 transition-colors cursor-pointer">
                <span className="font-mono text-xs text-gray-500 w-12">.{ext}</span>
                <span className="text-xs text-gray-700 flex-1">{info.desc}</span>
                <span className="text-xs font-mono text-gray-400 truncate">{info.mime}</span>
                {copied===ext && <span className="text-xs text-brand-400">\u2713</span>}
              </div>
            ))}
          </div>
        )}
        
        {mimeMatches.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Matching MIME types</p>
            {mimeMatches.map(([ext,info])=>(
              <div key={ext} onClick={()=>copy(info.mime,'m'+ext)} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-brand-300 transition-colors cursor-pointer">
                <span className="font-mono text-xs text-gray-500 w-12">.{ext}</span>
                <span className="text-xs font-mono text-gray-600 flex-1">{info.mime}</span>
                {copied===('m'+ext) && <span className="text-xs text-brand-400">\u2713</span>}
              </div>
            ))}
          </div>
        )}

        {!q && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Object.entries(MIME_DB).slice(0,20).map(([ext,info])=>(
              <div key={ext} onClick={()=>setQuery(ext)}
                className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-center cursor-pointer hover:border-brand-300 transition-colors">
                <div className="text-xs font-mono font-medium text-gray-700">.{ext}</div>
                <div className={'text-xs mt-0.5 px-1 rounded-full inline-block ' + (CATEGORY_COLORS[info.category]||'')}>{info.category}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
