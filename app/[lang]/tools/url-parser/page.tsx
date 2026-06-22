'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('url-parser')!

interface Parsed {
  protocol: string; host: string; hostname: string; port: string
  pathname: string; search: string; hash: string
  params: [string, string][]
  origin: string
}

function parseUrl(raw: string): Parsed | null {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw.trim() : 'https://' + raw.trim())
    const params: [string, string][] = []
    u.searchParams.forEach((v, k) => params.push([k, v]))
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.host,
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? '443' : '80') + ' (default)',
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      params,
      origin: u.origin,
    }
  } catch { return null }
}

export default function UrlParserPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('url-parser'); tracked.current = true }
  }

  const parsed = input.trim() ? parseUrl(input) : null

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('url-parser')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const fields: [string, string][] = parsed ? [
    ['Protocol', parsed.protocol],
    ['Origin', parsed.origin],
    ['Hostname', parsed.hostname],
    ['Port', parsed.port],
    ['Path', parsed.pathname],
    ['Query String', parsed.search || '(none)'],
    ['Hash / Fragment', parsed.hash || '(none)'],
  ] : []

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); track() }}
            placeholder="https://example.com/path?key=value&foo=bar#section"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {input.trim() && !parsed && (
            <p className="mt-1 text-xs text-red-600">Invalid URL — try adding https://</p>
          )}
        </div>
        {parsed && (
          <>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {fields.map(([label, val]) => (
                <div key={label} className="flex items-center px-4 py-2.5 gap-3 hover:bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500 w-36 shrink-0">{label}</span>
                  <span className="text-sm font-mono text-gray-800 flex-1 break-all">{val}</span>
                  {val !== '(none)' && (
                    <button onClick={() => copy(val, label)} className="text-xs text-brand-600 hover:underline shrink-0">
                      {copied === label ? '\u2713' : 'Copy'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {parsed.params.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters ({parsed.params.length})</h3>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {parsed.params.map(([k, v]) => (
                    <div key={k} className="flex items-center px-4 py-2.5 gap-3">
                      <span className="text-xs font-semibold text-brand-600 w-36 shrink-0 truncate">{k}</span>
                      <span className="text-sm font-mono text-gray-800 flex-1 break-all">{decodeURIComponent(v)}</span>
                      <button onClick={() => copy(v, 'param-' + k)} className="text-xs text-brand-600 hover:underline shrink-0">
                        {copied === 'param-' + k ? '\u2713' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
