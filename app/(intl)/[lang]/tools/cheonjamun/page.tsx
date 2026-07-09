'use client'

import Link from 'next/link'
import ClassicsLearner from '@/components/tools/ClassicsLearner'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONJAMUN } from '@/lib/classics/cheonjamun'
import { HANJA_LIST } from '@/lib/classics/hanja-index'

const tool = getToolBySlug('cheonjamun')!

export default function Page({ params }: { params: { lang: string } }) {
  return (
    <>
      <ClassicsLearner verses={CHEONJAMUN} tool={tool} lang={params.lang} slug="cheonjamun" tkey="cj" />
      {/* collapsed 한자 index — the crawl path into the 1000 per-character pages */}
      <details className="max-w-2xl mx-auto px-4 pb-10">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-brand-600">천자문 한자 사전 (1000자) — 글자를 누르면 훈·음과 용례를 봅니다</summary>
        <div className="flex flex-wrap mt-3 text-xl leading-relaxed" style={{ fontFamily: 'serif' }}>
          {HANJA_LIST.map((h) => (
            <Link key={h.idx} href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(h.hanja)}`} title={`${h.hun} ${h.eum}`}
              className="px-0.5 text-gray-500 hover:text-brand-600">{h.hanja}</Link>
          ))}
        </div>
      </details>
    </>
  )
}
