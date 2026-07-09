'use client'

import Link from 'next/link'
import ClassicsLearner from '@/components/tools/ClassicsLearner'
import { getToolBySlug } from '@/lib/tools/registry'
import { SAJASOHAK } from '@/lib/classics/sajasohak'

const tool = getToolBySlug('sajasohak')!

export default function Page({ params }: { params: { lang: string } }) {
  return (
    <>
      <ClassicsLearner verses={SAJASOHAK} tool={tool} lang={params.lang} slug="sajasohak" tkey="sj" />
      {/* collapsed verse index — the crawl path into the per-couplet pages */}
      <details className="max-w-2xl mx-auto px-4 pb-10">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-brand-600">사자소학 구절 사전 (39구) — 구절을 누르면 뜻과 한자 풀이를 봅니다</summary>
        <div className="mt-3 space-y-1">
          {SAJASOHAK.map((v) => (
            <Link key={v.no} href={`/${params.lang}/tools/sajasohak/${v.no}`}
              className="block text-sm text-gray-500 hover:text-brand-600">
              <span className="text-gray-400">제{v.no}구</span> <span style={{ fontFamily: 'serif' }}>{v.hanja}</span> {v.reading}
            </Link>
          ))}
        </div>
      </details>
    </>
  )
}
