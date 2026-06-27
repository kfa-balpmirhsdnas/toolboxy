'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('qr-scanner')!

export default function QrScannerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(''); setResult(''); setPreview(URL.createObjectURL(file))
    trackToolUsed('qr-scanner')
    const img = new Image()
    img.onload = async () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, c.width, c.height)
      const jsQR = (await import('jsqr')).default
      const code = jsQR(data.data, data.width, data.height)
      if (code?.data) setResult(code.data)
      else setError(t('qs_noqr'))
    }
    img.onerror = () => setError(t('qs_cantread'))
    img.src = URL.createObjectURL(file)
  }

  const isUrl = /^https?:\/\//i.test(result)
  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <p className="text-4xl mb-2">🔳</p>
          <p className="text-sm font-medium text-gray-600">{t('qs_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('qs_sub')}</p>
        </div>

        {preview && <img src={preview} alt="QR" className="max-h-40 rounded-xl border border-gray-200 object-contain mx-auto" />}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {result && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-700 mb-1 font-medium">{t('qs_decoded')}</p>
            <p className="text-sm text-gray-900 break-all">{result}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={copy} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">{copied ? t('qs_copied') : t('qs_copy')}</button>
              {isUrl && <a href={result} target="_blank" rel="noopener noreferrer" className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700">{t('qs_openlink')}</a>}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('qs_note')}</p>
      </div>
    </ToolLayout>
  )
}
