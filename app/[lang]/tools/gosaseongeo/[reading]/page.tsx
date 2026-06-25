import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { IDIOMS, BY_READING } from '@/lib/gosaseongeo'

const BASE = 'https://www.toolboxy.net'

export function generateStaticParams() {
  return IDIOMS.map((i) => ({ reading: i.reading }))
}

async function labels(lang: string): Promise<Record<string, string>> {
  try {
    const j = (await import(`../../../../../locales/${lang}/common.json`)).default as any
    return j.toolui || {}
  } catch { return {} }
}

export async function generateMetadata({ params }: { params: { lang: string; reading: string } }): Promise<Metadata> {
  const i = BY_READING[decodeURIComponent(params.reading)]
  if (!i) return {}
  const title = `${i.reading}(${i.hanja}) 뜻 - 고사성어`
  const description = `${i.hanja}(${i.reading}): ${i.fig}${i.origin ? ' 유래: ' + i.origin : ''}`.slice(0, 155)
  const url = `${BASE}/${params.lang}/tools/gosaseongeo/${encodeURIComponent(i.reading)}`
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article' },
  }
}

export default async function IdiomPage({ params }: { params: { lang: string; reading: string } }) {
  const reading = decodeURIComponent(params.reading)
  const i = BY_READING[reading]
  if (!i) notFound()
  const t = await labels(params.lang)
  const L = (k: string, fb: string) => t[k] || fb
  const synLinks = i.syn.map((h) => ({ h, item: IDIOMS.find((x) => x.hanja === h) }))
  const related = IDIOMS.filter((x) => x.id !== i.id && (x.len === i.len || x.syn.includes(i.hanja))).slice(0, 8)

  const faq = [
    { q: `${i.reading}(${i.hanja})의 뜻은?`, a: i.fig },
    ...(i.origin ? [{ q: `${i.reading}의 유래는?`, a: i.origin }] : []),
    ...(i.example ? [{ q: `${i.reading} 예문은?`, a: i.example }] : []),
  ]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-3 flex gap-3"><span className="text-sm text-gray-400 w-14 shrink-0">{label}</span><span className="text-gray-800">{children}</span></div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${params.lang}/tools/gosaseongeo`} className="hover:text-brand-600">← {L('gs_title', '고사성어 사전')}</Link>
      </nav>

      <div className="text-center py-6 rounded-2xl border-2 border-gray-100">
        <div className="text-5xl font-bold text-gray-900 tracking-wide" style={{ fontFamily: 'serif' }}>{i.hanja}</div>
        <div className="text-lg text-gray-500 mt-2">{i.reading}</div>
      </div>

      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label={L('gs_lit', '겉뜻')}>{i.lit}</Row>
        <Row label={L('gs_fig', '속뜻')}><b>{i.fig}</b></Row>
        {i.origin && <Row label={L('gs_origin', '유래')}>{i.origin}</Row>}
        {i.source && <Row label={L('gs_source', '출전')}>{i.source}</Row>}
        {i.example && <Row label={L('gs_example', '예문')}><span className="text-gray-600">“{i.example}”</span></Row>}
        {synLinks.length > 0 && (
          <Row label={L('gs_syn', '유의어')}>
            <span className="flex flex-wrap gap-2">
              {synLinks.map(({ h, item }) => item
                ? <Link key={h} href={`/${params.lang}/tools/gosaseongeo/${encodeURIComponent(item.reading)}`} className="text-brand-600 hover:underline">{h}</Link>
                : <span key={h} className="text-gray-500">{h}</span>)}
            </span>
          </Row>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{L('gs_related', '관련 고사성어')}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.id} href={`/${params.lang}/tools/gosaseongeo/${encodeURIComponent(r.reading)}`}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600">
                {r.hanja} <span className="text-gray-400">{r.reading}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
