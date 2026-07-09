import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CHEONJAMUN } from '@/lib/classics/cheonjamun'
import { SAJASOHAK } from '@/lib/classics/sajasohak'
import { HANJA_LIST, HANJA_BY_CHAR } from '@/lib/classics/hanja-index'
import { IDIOMS } from '@/lib/gosaseongeo'

// Longtail 한자 pages, one per 천자문 character ("天 한자 뜻", "현 한자"…). The thin-content
// risk is covered with REAL related data only: the source verse, same-음/훈 characters,
// 고사성어 that contain the character, and 사자소학 usages — no fabricated facts.
// Korean-only content → every locale consolidates onto the /ko page (gosaseongeo model).

const BASE = 'https://www.toolboxy.net'

export function generateStaticParams() {
  return HANJA_LIST.map((h) => ({ hanja: h.hanja }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function labels(lang: string): Promise<Record<string, any>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = (await import(`../../../../../../locales/${lang}/common.json`)).default as any
    return j.toolui || {}
  } catch { return {} }
}

export async function generateMetadata({ params }: { params: { hanja: string } }): Promise<Metadata> {
  const ch = decodeURIComponent(params.hanja)
  const h = HANJA_BY_CHAR[ch]
  if (!h) return {}
  const title = `${h.hanja} 뜻 — ${h.hun} ${h.eum} (천자문 한자)`
  const verse = CHEONJAMUN[h.verseNo - 1]
  const description = `한자 ${h.hanja}의 훈(뜻)은 '${h.hun}', 음(소리)은 '${h.eum}'입니다. 천자문 제${h.verseNo}구 ${verse.hanja}(${verse.reading})에 나오며, 같은 음 한자와 고사성어 용례까지 함께 확인하세요.`.slice(0, 155)
  const canonical = `${BASE}/ko/tools/cheonjamun/${encodeURIComponent(h.hanja)}`
  return {
    title: { absolute: `${title} | ToolBoxy` }, description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article' },
  }
}

export default async function HanjaPage({ params }: { params: { lang: string; hanja: string } }) {
  const ch = decodeURIComponent(params.hanja)
  const h = HANJA_BY_CHAR[ch]
  if (!h) notFound()
  const t = await labels(params.lang)
  const L = (k: string, fb: string) => (typeof t[k] === 'string' ? t[k] : fb)
  const verse = CHEONJAMUN[h.verseNo - 1]
  const sameEum = HANJA_LIST.filter((x) => x.eum === h.eum && x.hanja !== h.hanja).slice(0, 12)
  const sameHun = HANJA_LIST.filter((x) => x.hun === h.hun && x.hanja !== h.hanja && x.eum !== h.eum).slice(0, 12)
  const idioms = IDIOMS.filter((i) => i.hanja.includes(h.hanja)).slice(0, 10)
  const saja = SAJASOHAK.filter((v) => v.hanja.includes(h.hanja)).slice(0, 4)
  const prev = HANJA_LIST[h.idx - 1]
  const next = HANJA_LIST[h.idx + 1]
  const cp = 'U+' + h.hanja.codePointAt(0)!.toString(16).toUpperCase()

  const faq: [string, string][] = [
    [`${h.hanja} 한자의 뜻은?`, `${h.hanja}의 훈(뜻)은 '${h.hun}', 음(소리)은 '${h.eum}'입니다. '${h.hun} ${h.eum}'으로 읽습니다.`],
    [`${h.hanja}이(가) 나오는 천자문 구절은?`, `천자문 제${h.verseNo}구 ${verse.hanja}(${verse.reading})에 나옵니다.`],
    ...(idioms.length ? [[`${h.hanja}이(가) 들어간 고사성어는?`, `${idioms.slice(0, 3).map((i) => `${i.hanja}(${i.reading})`).join(', ')} 등이 있습니다.`] as [string, string]] : []),
  ]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  const chip = 'px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${params.lang}/tools/cheonjamun`} className="hover:text-brand-600">← {L('cj_title', '천자문')}</Link>
      </nav>

      {/* hero: the character, big */}
      <div className="text-center py-8 rounded-2xl border-2 border-gray-100">
        <div className="text-8xl font-bold text-gray-900 leading-none" style={{ fontFamily: 'serif' }}>{h.hanja}</div>
        <div className="text-2xl text-gray-700 mt-4 font-semibold">{h.hun} <b className="text-brand-600">{h.eum}</b></div>
        <div className="text-xs text-gray-400 mt-2 font-mono">{cp}</div>
      </div>

      {/* source verse */}
      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">천자문 제{h.verseNo}구</h2>
        <p className="text-3xl tracking-widest" style={{ fontFamily: 'serif' }}>
          {verse.hanja.split('').map((c, i) => (
            c === h.hanja
              ? <b key={i} className="text-brand-600">{c}</b>
              : HANJA_BY_CHAR[c]
                ? <Link key={i} href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(c)}`} className="text-gray-800 hover:text-brand-600">{c}</Link>
                : <span key={i} className="text-gray-800">{c}</span>
          ))}
        </p>
        <p className="text-sm text-gray-500 mt-1">{verse.reading}</p>
        <p className="text-xs text-gray-400 mt-2">{verse.chars.map((c) => `${c.hanja} ${c.hun} ${c.eum}`).join(' · ')}</p>
      </div>

      {/* same-sound characters */}
      {sameEum.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">같은 음 한자 — &lsquo;{h.eum}&rsquo;</h2>
          <div className="flex flex-wrap gap-2">
            {sameEum.map((x) => (
              <Link key={x.hanja} href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(x.hanja)}`} className={chip}>
                <span style={{ fontFamily: 'serif' }}>{x.hanja}</span> <span className="text-gray-400">{x.hun} {x.eum}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* same-meaning characters */}
      {sameHun.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">같은 훈 한자 — &lsquo;{h.hun}&rsquo;</h2>
          <div className="flex flex-wrap gap-2">
            {sameHun.map((x) => (
              <Link key={x.hanja} href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(x.hanja)}`} className={chip}>
                <span style={{ fontFamily: 'serif' }}>{x.hanja}</span> <span className="text-gray-400">{x.hun} {x.eum}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* idioms that use this character */}
      {idioms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{h.hanja}이(가) 들어간 고사성어</h2>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {idioms.map((i) => (
              <Link key={i.hanja} href={`/${params.lang}/tools/gosaseongeo/${encodeURIComponent(i.reading)}`} className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-gray-50">
                <span className="shrink-0 font-semibold text-gray-800" style={{ fontFamily: 'serif' }}>{i.hanja}</span>
                <span className="shrink-0 text-sm text-gray-500">{i.reading}</span>
                <span className="text-sm text-gray-400 truncate">{i.fig}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 사자소학 usages */}
      {saja.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">사자소학 속 쓰임</h2>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {saja.map((v) => (
              <Link key={v.no} href={`/${params.lang}/tools/sajasohak/${v.no}`} className="block px-4 py-2.5 hover:bg-gray-50">
                <span className="font-semibold text-gray-800" style={{ fontFamily: 'serif' }}>{v.hanja}</span>
                <span className="ml-2 text-sm text-gray-500">{v.reading}</span>
                {v.meaning && <span className="block text-xs text-gray-400 mt-0.5 truncate">{v.meaning}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* prev / next in the 천자문 order */}
      <div className="flex items-center justify-between gap-2">
        {prev ? (
          <Link href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(prev.hanja)}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">← <span style={{ fontFamily: 'serif' }}>{prev.hanja}</span> {prev.hun} {prev.eum}</Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/${params.lang}/tools/cheonjamun/${encodeURIComponent(next.hanja)}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 text-right hover:border-brand-400 hover:text-brand-600">{next.hun} {next.eum} <span style={{ fontFamily: 'serif' }}>{next.hanja}</span> →</Link>
        ) : <span className="flex-1" />}
      </div>
    </div>
  )
}
