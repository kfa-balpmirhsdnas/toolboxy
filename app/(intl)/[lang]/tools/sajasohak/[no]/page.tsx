import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SAJASOHAK } from '@/lib/classics/sajasohak'
import { HANJA_BY_CHAR } from '@/lib/classics/hanja-index'

// Longtail 사자소학 pages, one per couplet ("부생아신 모국오신 뜻"…). Characters that also
// appear in the 천자문 link into the per-character 한자 pages. Korean-only content →
// every locale consolidates onto /ko (gosaseongeo model).

const BASE = 'https://www.toolboxy.net'

export function generateStaticParams() {
  return SAJASOHAK.map((v) => ({ no: String(v.no) }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function labels(lang: string): Promise<Record<string, any>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = (await import(`../../../../../../locales/${lang}/common.json`)).default as any
    return j.toolui || {}
  } catch { return {} }
}

export async function generateMetadata({ params }: { params: { no: string } }): Promise<Metadata> {
  const v = SAJASOHAK.find((x) => x.no === Number(params.no))
  if (!v) return {}
  const title = `${v.reading} 뜻 — 사자소학 제${v.no}구 (${v.hanja})`
  const description = `사자소학 제${v.no}구 ${v.hanja}(${v.reading}): ${v.meaning || ''}`.slice(0, 155)
  const canonical = `${BASE}/ko/tools/sajasohak/${v.no}`
  return {
    title: { absolute: `${title} | ToolBoxy` }, description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article' },
  }
}

export default async function SajasohakVersePage({ params }: { params: { lang: string; no: string } }) {
  const v = SAJASOHAK.find((x) => x.no === Number(params.no))
  if (!v) notFound()
  const t = await labels(params.lang)
  const L = (k: string, fb: string) => (typeof t[k] === 'string' ? t[k] : fb)
  const prev = SAJASOHAK.find((x) => x.no === v.no - 1)
  const next = SAJASOHAK.find((x) => x.no === v.no + 1)
  const sameTopic = SAJASOHAK.filter((x) => x.topic === v.topic && x.no !== v.no).slice(0, 8)
  const chars = v.hanja.replace(/\s+/g, '').split('')

  const faq: [string, string][] = [
    [`'${v.reading}'의 뜻은?`, `사자소학 제${v.no}구 ${v.hanja}(${v.reading})의 뜻은 '${v.meaning || ''}'입니다.`],
    [`'${v.reading}'의 한자는?`, `${v.hanja}라고 씁니다.`],
  ]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${params.lang}/tools/sajasohak`} className="hover:text-brand-600">← {L('ssh_title', '사자소학')}</Link>
      </nav>

      <div className="text-center py-7 rounded-2xl border-2 border-gray-100">
        <p className="text-xs font-semibold text-gray-400 mb-2">사자소학 제{v.no}구{v.topic ? ` · ${v.topic}` : ''}</p>
        <div className="text-4xl font-bold text-gray-900 tracking-wide leading-snug" style={{ fontFamily: 'serif' }}>{v.hanja}</div>
        <div className="text-lg text-gray-500 mt-2">{v.reading}</div>
        {v.meaning && <p className="text-base text-gray-700 mt-4 px-6 leading-relaxed"><b>{v.meaning}</b></p>}
      </div>

      {/* character-by-character breakdown — links into the 천자문 한자 pages where available */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">한자 풀이</h2>
        <div className="flex flex-wrap gap-2">
          {chars.map((c, i) => {
            const h = HANJA_BY_CHAR[c]
            return h ? (
              <Link key={i} href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(c)}`}
                className="flex flex-col items-center px-3 py-2 rounded-xl border border-gray-200 hover:border-brand-400 hover:text-brand-600">
                <span className="text-2xl" style={{ fontFamily: 'serif' }}>{c}</span>
                <span className="text-[11px] text-gray-400 mt-0.5">{h.hun} {h.eum}</span>
              </Link>
            ) : (
              <span key={i} className="flex flex-col items-center px-3 py-2 rounded-xl border border-gray-100 text-gray-700">
                <span className="text-2xl" style={{ fontFamily: 'serif' }}>{c}</span>
                <span className="text-[11px] text-gray-300 mt-0.5">—</span>
              </span>
            )
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">훈·음이 표시된 한자는 천자문 한자 사전으로 이동합니다.</p>
      </div>

      {/* same topic */}
      {sameTopic.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{v.topic} 편의 다른 구절</h2>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {sameTopic.map((x) => (
              <Link key={x.no} href={`/${params.lang}/tools/sajasohak/${x.no}`} className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-gray-50">
                <span className="shrink-0 text-xs text-gray-400">제{x.no}구</span>
                <span className="shrink-0 font-semibold text-gray-800" style={{ fontFamily: 'serif' }}>{x.hanja}</span>
                <span className="text-sm text-gray-400 truncate">{x.reading}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* prev / next */}
      <div className="flex items-center justify-between gap-2">
        {prev ? (
          <Link href={`/${params.lang}/tools/sajasohak/${prev.no}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">← 제{prev.no}구 {prev.reading}</Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/${params.lang}/tools/sajasohak/${next.no}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 text-right hover:border-brand-400 hover:text-brand-600">제{next.no}구 {next.reading} →</Link>
        ) : <span className="flex-1" />}
      </div>
    </div>
  )
}
