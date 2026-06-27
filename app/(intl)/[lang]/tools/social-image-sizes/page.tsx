'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('social-image-sizes')!

type Size = [labelKey: string, dims: string]
const DATA: { name: string; sizes: Size[] }[] = [
  { name: 'Instagram', sizes: [['sis_post_square', '1080 × 1080'], ['sis_post_portrait', '1080 × 1350'], ['sis_story', '1080 × 1920'], ['sis_profile', '320 × 320']] },
  { name: 'YouTube', sizes: [['sis_thumbnail', '1280 × 720'], ['sis_channelart', '2560 × 1440'], ['sis_profile', '800 × 800']] },
  { name: 'X (Twitter)', sizes: [['sis_post', '1600 × 900'], ['sis_header', '1500 × 500'], ['sis_profile', '400 × 400']] },
  { name: 'Facebook', sizes: [['sis_post', '1200 × 630'], ['sis_cover', '851 × 315'], ['sis_profile', '360 × 360']] },
  { name: 'TikTok', sizes: [['sis_video', '1080 × 1920'], ['sis_profile', '200 × 200']] },
  { name: 'LinkedIn', sizes: [['sis_post', '1200 × 627'], ['sis_cover', '1584 × 396'], ['sis_profile', '400 × 400']] },
]

export default function SocialImageSizesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [copied, setCopied] = useState('')
  function copy(dims: string) { const v = dims.replace(/\s|×/g, (m) => (m === '×' ? 'x' : '')); navigator.clipboard?.writeText(v); setCopied(dims); setTimeout(() => setCopied(''), 1200) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sis_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sis_subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {DATA.map((p) => (
            <div key={p.name} className="rounded-2xl border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-2">{p.name}</h2>
              <div className="divide-y divide-gray-100">
                {p.sizes.map(([k, dims]) => (
                  <button key={k + dims} onClick={() => copy(dims)} title={t('sis_copy')}
                    className="w-full flex items-center justify-between gap-2 py-2 text-sm group">
                    <span className="text-gray-600">{t(k)}</span>
                    <span className="font-medium text-gray-900 tabular-nums group-hover:text-brand-600">{copied === dims ? `✓ ${t('sis_copied')}` : dims}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">{t('sis_note')}</p>
      </div>
    </ToolLayout>
  )
}
