'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('html-minifier')!

interface Options {
  removeComments: boolean
  collapseWhitespace: boolean
  removeEmptyAttributes: boolean
  removeOptionalTags: boolean
  minifyCSS: boolean
  minifyJS: boolean
}

function minifyHtml(html: string, opts: Options): string {
  let result = html

  if (opts.removeComments) {
    result = result.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
  }

  if (opts.minifyCSS) {
    result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
      const minCss = css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{};:,>+~]|\s)\s*/g,'$1').replace(/;}/g,'}').trim()
      return match.replace(css, minCss)
    })
  }

  if (opts.minifyJS) {
    result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
      const minJs = js.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim()
      return match.replace(js, minJs)
    })
  }

  if (opts.collapseWhitespace) {
    result = result.replace(/>[\s\n\r]+</g,'><')
    result = result.replace(/\s{2,}/g,' ')
    result = result.replace(/\n/g,'')
  }

  if (opts.removeEmptyAttributes) {
    result = result.replace(/\s(class|id|style)=""/g,'')
  }

  if (opts.removeOptionalTags) {
    result = result.replace(/<\/(html|head|body)>/gi,'')
  }

  return result.trim()
}

export default function HtmlMinifierPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Page</title>
    <!-- This is a comment -->
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
    <script>
      // Log a message
      console.log('hello');
    </script>
  </body>
</html>`)
  const [opts, setOpts] = useState<Options>({
    removeComments: true,
    collapseWhitespace: true,
    removeEmptyAttributes: true,
    removeOptionalTags: false,
    minifyCSS: true,
    minifyJS: true,
  })
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('html-minifier'); tracked.current = true } }

  const output = minifyHtml(input, opts)
  const savings = input.length ? Math.round((1 - output.length/input.length)*100) : 0

  async function copy() { await navigator.clipboard.writeText(output); trackToolCopy('html-minifier'); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  function download() {
    const blob=new Blob([output],{type:'text/html'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minified.html';a.click()
    trackToolDownload('html-minifier','html')
  }

  const OPTION_LABELS: Record<keyof Options,string> = {
    removeComments:'Remove comments',
    collapseWhitespace:'Collapse whitespace',
    removeEmptyAttributes:'Remove empty attributes',
    removeOptionalTags:'Remove optional tags',
    minifyCSS:'Minify inline CSS',
    minifyJS:'Minify inline JS',
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(opts) as (keyof Options)[]).map(k=>(
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={opts[k]} onChange={e=>{setOpts({...opts,[k]:e.target.checked});track()}}
                className="w-4 h-4 accent-brand-600 rounded" />
              <span className="text-xs text-gray-600">{OPTION_LABELS[k]}</span>
            </label>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Input ({input.length} bytes)</label>
            </div>
            <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output ({output.length} bytes · {savings}% saved)</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-gray-500 hover:text-gray-700">Download</button>
              </div>
            </div>
            <textarea value={output} readOnly rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50 resize-none" />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
