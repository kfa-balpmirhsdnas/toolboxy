'use client'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import TaxiFareTool from '@/components/tools/TaxiFareTool'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('taxi-route')!
// Leaflet은 B형에서만 — SSR 제외 + 코드 스플리팅 (A형·타 도구 번들 영향 0)
const TaxiMap = dynamic(() => import('@/components/tools/TaxiMap'), { ssr: false })

export default function TaxiRoutePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('txf_route_title')}</h1>
          <p className="text-gray-500 text-sm">{t('txf_route_subtitle')}</p>
        </div>
        <TaxiFareTool lang={params.lang} slug="taxi-route" MapComp={TaxiMap} />
        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${params.lang}/tools/taxi-fare`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            🚕 {t('txf_rel_fare')}
          </Link>
          <Link href={`/${params.lang}/tools/capital-distance`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            📏 {t('txf_rel_dist')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
