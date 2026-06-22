'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('yaml-to-json')!

// Lightweight YAML parser (supports key: value, lists, nesting, strings, numbers, booleans)
function parseYaml(yaml: string): unknown {
  const lines = yaml.split('\n')
  type Frame = { indent: number; obj: Record<string, unknown> | unknown[]; key?: string }
  const stack: Frame[] = [{ indent: -1, obj: {} }]

  function parseScalar(v: string): unknown {
    const t = v.trim()
    if (t === 'true') return true
    if (t === 'false') return false
    if (t === 'null' || t === '~') return null
    if (/^-?\d+$/.test(t)) return parseInt(t, 10)
    if (/^-?\d*\.\d+$/.test(t)) return parseFloat(t)
    return t.replace(/^["']|["']$/g, '')
  }

  for (const rawLine of lines) {
    if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) continue
    const indent = rawLine.search(/\S/)
    const line = rawLine.trim()

    // Pop stack to correct indent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack[stack.length - 1]

    if (line.startsWith('- ')) {
      // List item
      const val = parseScalar(line.slice(2))
      if (Array.isArray(parent.obj)) {
        parent.obj.push(val)
      } else if (parent.key !== undefined) {
        const arr: unknown[] = [val]
        ;(parent.obj as Record<string, unknown>)[parent.key] = arr
        stack.push({ indent, obj: arr })
      }
    } else if (line.includes(': ')) {
      const colonIdx = line.indexOf(': ')
      const key = line.slice(0, colonIdx).trim()
      const val = line.slice(colonIdx + 2).trim()
      const target = Array.isArray(parent.obj) ? {} : parent.obj as Record<string, unknown>
      if (Array.isArray(parent.obj)) parent.obj.push(target)
      if (val === '' || val === '|' || val === '>') {
        const nested: Record<string, unknown> = {}
        target[key] = nested
        stack.push({ indent, obj: target, key })
        stack.push({ indent: indent + 2, obj: nested })
      } else {
        target[key] = parseScalar(val)
        stack[stack.length - 1] = { ...parent, key }
      }
    } else if (line.endsWith(':')) {
      const key = line.slice(0, -1).trim()
      const nested: Record<string, unknown> = {}
      const target = parent.obj as Record<string, unknown>
      target[key] = nested
      stack.push({ indent, obj: nested, key })
    }
  }
  return stack[0].obj
}

const PLACEHOLDER = `name: ToolBoxy
version: 1
features:
  - json-formatter
  - base64-encoder
settings:
  theme: dark
  language: en`

export default function YamlToJsonPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function convert() {
    if (!input.trim()) return
    if (!tracked.current) { trackToolUsed('yaml-to-json'); tracked.current = true }
    try {
      const parsed = parseYaml(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (e: unknown) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('yaml-to-json')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">YAML Input</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setOutput(''); setError('') }}
            placeholder={PLACEHOLDER}
            className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={convert}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Convert to JSON
        </button>
        {error && <p className="text-sm text-red-600 font-mono bg-red-50 p-3 rounded-xl border border-red-200">❌ {error}</p>}
        {output && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">JSON OUTPUT</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-600 bg-gray-50 focus:outline-none"
              />
              <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Supports key-value pairs, lists, nested objects, strings, numbers, booleans</p>
      </div>
    </ToolLayout>
  )
}
