'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('jwt-decoder')!

function b64Decode(str: string): string {
  try {
    return decodeURIComponent(
      escape(atob(str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')))
    )
  } catch { return '' }
}

function decodeJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return null
  try {
    const header = JSON.parse(b64Decode(parts[0]))
    const payload = JSON.parse(b64Decode(parts[1]))
    return { header, payload, signature: parts[2] }
  } catch { return null }
}

export default function JwtDecoderPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')

  const decoded = input.trim() ? decodeJwt(input) : null
  const isExpired = decoded?.payload?.exp ? decoded.payload.exp * 1000 < Date.now() : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT here…"
            className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {input && !decoded && (
          <p className="text-sm text-red-500">⚠ Invalid JWT — must have 3 dot-separated parts</p>
        )}
        {decoded && (
          <div className="space-y-3">
            {isExpired !== null && (
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {isExpired ? '⚠ Token is expired' : '✓ Token is not expired'}
                {decoded.payload.exp && <span className="ml-2 text-xs opacity-70">exp: {new Date(decoded.payload.exp * 1000).toLocaleString()}</span>}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Header</p>
              <pre className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">Payload</p>
              <pre className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(decoded.payload, null, 2)}</pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Signature</p>
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-500 break-all">{decoded.signature}</p>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">Client-side only — your token never leaves your browser</p>
      </div>
    </ToolLayout>
  )
}
