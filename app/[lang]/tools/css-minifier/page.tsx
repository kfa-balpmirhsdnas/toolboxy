'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')   // remove comments
    .replace(/\s+/g, ' ')                   // collapse whitespace
    .replace(/\s*({|}|:|;|,)\s*/g, '$1')  // remove space around symbols
    .replace(/;}/g, '}')                    // remove last semicolon before }
    .trim()
}

function beautifyCSS(css: string): string {
  const min = minifyCSS(css)
  let depth = 0
  let out = ''
  for (let i = 0; i < min.length; i++) {
    const c = min[i]
    if (c === '{') { out += ' {\n'; depth++; out += '  '.repeat(depth) }
    else if (c === '}') { depth--; out += '\n' + '  '.repeat(depth) + '}\n' }
    else if (c === ';') { out += ';\n' + '  '.repeat(depth) }
    else out += c
  }
  return out.trim()
}


const tool = getToolBySlug('css-minifier')!

export default function CSSMinifierPage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'minify'|'beautify'>('minify')

  const output = input ? (mode === 'minify' ? minifyCSS(input) : beautifyCSS(input)) : ''
  const saved = input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0
  const copy = () => navigator.clipboard.writeText(output)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Minifier / Beautifier</h1>
        <p className="text-gray-500 mb-8">Minify CSS to reduce file size, or beautify minified CSS for readability.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex gap-2">
            {(['minify','beautify'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode===m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSS Input</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your CSS here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          {output && (
            <>
              {mode === 'minify' && (
                <div className="text-sm text-green-600 font-medium">
                  Size reduced by {saved}% ({input.length} -> {output.length} bytes)
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm font-mono h-48 resize-none"
                  readOnly value={output}
                />
              </div>
              <button onClick={copy} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy Output
              </button>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
