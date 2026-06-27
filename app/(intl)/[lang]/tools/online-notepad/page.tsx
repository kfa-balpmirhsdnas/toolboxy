'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('online-notepad')!
const STORAGE_KEY = 'toolboxy-notepad'

export default function OnlineNotepadPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  // Restore on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setText(stored)
    } catch { /* ignore */ }
  }, [])

  // Autosave (debounced) whenever text changes
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text)
        setSaved(true)
      } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(id)
  }, [text])

  function onChange(v: string) {
    setText(v)
    setSaved(false)
    if (!tracked.current) { trackToolUsed('online-notepad'); tracked.current = true }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'notes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function copy() {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function clear() {
    if (!text) return
    if (!window.confirm(t('np_clearconfirm'))) return
    setText('')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\n/).length : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_words', { n: words })}</span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_chars', { n: chars })}</span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">{t('np_lines', { n: lines })}</span>
          </div>
          <span className={'text-xs font-medium transition-colors ' + (saved ? 'text-green-600' : 'text-gray-400')}>
            {saved ? '✓ ' + t('np_autosaved') : t('np_saving')}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('np_placeholder')}
          spellCheck={false}
          className="w-full h-[60vh] min-h-72 p-4 border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
        />

        <div className="flex gap-2 flex-wrap">
          <button onClick={download} disabled={!text}
            className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ⬇ {t('np_download')}
          </button>
          <button onClick={copy} disabled={!text}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {copied ? '✓ ' + t('np_copied') : t('ui_copy')}
          </button>
          <button onClick={clear} disabled={!text}
            className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto">
            {t('ui_clear')}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">{t('np_note')}</p>
      </div>
    </ToolLayout>
  )
}
