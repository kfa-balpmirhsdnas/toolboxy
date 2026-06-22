'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('yaml-validator')!

// Minimal YAML parser for validation
function validateYaml(text: string): { valid: boolean; error?: string; lines: number } {
  const lines = text.split('\n')
  const indentStack: number[] = [0]
  let inBlock = false
  let inMultiline = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const indent = line.match(/^(\s*)/)?.[1].length || 0
    
    // Check for tabs (not allowed in YAML)
    if (line.match(/^\t/)) {
      return { valid: false, error: 'Line ' + (i+1) + ': Tabs not allowed in YAML indentation', lines: lines.length }
    }
    
    // Check key: value pattern
    if (!inMultiline) {
      if (trimmed.endsWith('|') || trimmed.endsWith('>')) inMultiline = true
      // Basic key validation
      if (!trimmed.startsWith('-') && trimmed.includes(':')) {
        const key = trimmed.split(':')[0].trim()
        if (key.match(/[{}\[\]]/)) {
          return { valid: false, error: 'Line ' + (i+1) + ': Invalid character in key', lines: lines.length }
        }
      }
    } else {
      if (indent <= (indentStack[indentStack.length-1] || 0) && trimmed) inMultiline = false
    }
  }
  
  return { valid: true, lines: lines.length }
}

// Convert YAML-like to JSON representation (simplified)
function yamlToJsonStr(text: string): string {
  try {
    // Very basic conversion for display
    const obj: Record<string,unknown> = {}
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
      const colonIdx = trimmed.indexOf(':')
      if (colonIdx > 0) {
        const key = trimmed.slice(0,colonIdx).trim()
        const val = trimmed.slice(colonIdx+1).trim()
        if (val && !val.startsWith('|') && !val.startsWith('>')) {
          obj[key] = val.startsWith('"') || val.startsWith("'") ? val.slice(1,-1) :
            val === 'true' ? true : val === 'false' ? false :
            !isNaN(Number(val)) ? Number(val) : val
        }
      }
    }
    return JSON.stringify(obj, null, 2)
  } catch { return '' }
}

export default function YamlValidatorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('name: ToolBoxy\nversion: 1.0\ndebug: false\nfeatures:\n  - tools\n  - api')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('yaml-validator'); tracked.current = true }
  }

  const result = input.trim() ? validateYaml(input) : null
  const jsonStr = result?.valid ? yamlToJsonStr(input) : ''

  async function copy() {
    await navigator.clipboard.writeText(jsonStr)
    trackToolCopy('yaml-validator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">YAML Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={8}
            className={'w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (result && !result.valid ? 'border-red-300':'border-gray-200')} />
        </div>
        {result && (
          <div className={'p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ' + (result.valid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
            {result.valid ? '\u2713 Valid YAML (' + result.lines + ' lines)' : '\u00D7 ' + result.error}
          </div>
        )}
        {jsonStr && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">JSON Representation (top-level)</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy JSON'}</button>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-48">{jsonStr}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
