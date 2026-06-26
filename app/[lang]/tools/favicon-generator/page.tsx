'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('favicon-generator')!
const SIZES = [16, 32, 48, 180, 192, 512]

const LINK_TAGS = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">`

export default function FaviconGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [preview, setPreview] = useState('')
  const [icons, setIcons] = useState<{ size: number; url: string }[]>([])
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    trackToolUsed('favicon-generator')
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new Image()
    img.onload = () => {
      const out: { size: number; url: string }[] = []
      let pending = SIZES.length
      SIZES.forEach((size) => {
        const c = document.createElement('canvas')
        c.width = c.height = size
        c.getContext('2d')!.drawImage(img, 0, 0, size, size)
        c.toBlob((blob) => {
          if (blob) out.push({ size, url: URL.createObjectURL(blob) })
          if (--pending === 0) setIcons(out.sort((a, b) => a.size - b.size))
        }, 'image/png')
      })
    }
    img.src = url
  }

  function download(size: number, url: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = `favicon-${size}.png`
    a.click()
    trackToolDownload('favicon-generator', 'png')
  }

  async function copyTags() {
    await navigator.clipboard.writeText(LINK_TAGS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {preview ? <img src={preview} alt="source" className="max-h-32 mx-auto rounded-lg" />
            : <><p className="text-4xl mb-2">🎨</p><p className="text-sm font-medium text-gray-600">{t('fg_drop')}</p><p className="text-xs text-gray-400 mt-1">{t('fg_recommend')}</p></>}
        </div>

        {icons.length > 0 && (
          <>
            <div className="flex flex-wrap gap-4 justify-center items-end">
              {icons.map(({ size, url }) => (
                <button key={size} onClick={() => download(size, url)} className="flex flex-col items-center gap-1 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${size}px`} width={Math.min(size, 64)} height={Math.min(size, 64)} className="rounded border border-gray-200 group-hover:ring-2 ring-brand-400" />
                  <span className="text-xs text-gray-500">{size}px ⬇</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fg_htmltags')}</label>
              <pre className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap">{LINK_TAGS}</pre>
              <button onClick={copyTags} className="absolute top-8 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ '+t('ui_copied') : t('ui_copy')}</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">{t('fg_note')}</p>
      </div>

    </ToolLayout>
  )
}
