'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import TaxiFareTool from '@/components/tools/TaxiFareTool'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('taxi-fare')!

export default function TaxiFarePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('txf_title')}</h1>
          <p className="text-gray-500 text-sm">{t('txf_subtitle')}</p>
        </div>
        <TaxiFareTool lang={params.lang} slug="taxi-fare" />
        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${params.lang}/tools/taxi-route`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            🗺 {t('txf_rel_route')}
          </Link>
          <Link href={`/${params.lang}/tools/time-difference`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            🌏 {t('txf_rel_timediff')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
