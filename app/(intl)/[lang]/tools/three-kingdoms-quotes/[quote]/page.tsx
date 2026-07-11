import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TK_QUOTES, TKQ_BY_SLUG, quotesForPerson, type TKQuote } from '@/lib/tools/threeKingdomsQuotes'
import { TKC_BY_ID } from '@/lib/tools/threeKingdomsCharacters'
import { PEOPLE } from '@/lib/tools/threeKingdomsIdioms'
import { SRC_META, asTKLang, type TKLang } from '@/lib/tools/tkCommon'
import { TKSrcBadge } from '@/components/tools/TKBadge'
import TKQuoteCard from '@/components/tools/TKQuoteCard'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

// person name: hub first, PEOPLE fallback (허소 등 60인 외 인물)
const personName = (id: string, lang: TKLang) => TKC_BY_ID[id]?.name[lang] ?? PEOPLE[id]?.name[lang] ?? id
const personHanja = (id: string) => TKC_BY_ID[id]?.hanja ?? PEOPLE[id]?.hanja ?? ''

const S = {
  ko: {
    title: (q: TKQuote) => `${personName(q.person, 'ko')} 명언 - ${q.gist.ko}`,
    desc: (q: TKQuote) => `"${q.trans.ko}" — ${personName(q.person, 'ko')}(${q.hanmun}). 발화 맥락과 출처(${q.srcName.ko})까지 정리한 삼국지 명언.`,
    orig: '원문', trans: '번역', context: '이 말이 나온 장면', source: '출처', person: '말한 사람',
    more: '이 인물의 다른 명언', all: '삼국지 명언 전체 보기', save: '명언 카드 저장',
    charBanner: '인물 사전에서 보기',
  },
  ja: {
    title: (q: TKQuote) => `${personName(q.person, 'ja')}の名言 - ${q.gist.ja}`,
    desc: (q: TKQuote) => `「${q.trans.ja}」 — ${personName(q.person, 'ja')}（${q.hanmun}）。発言の背景と出典（${q.srcName.ja}）まで解説する三国志の名言。`,
    orig: '原文', trans: '訳', context: 'この言葉が生まれた場面', source: '出典', person: '発言者',
    more: 'この人物の他の名言', all: '三国志の名言をすべて見る', save: '名言カードを保存',
    charBanner: '人物事典で見る',
  },
  en: {
    title: (q: TKQuote) => `${personName(q.person, 'en')} Quote - ${q.gist.en}`,
    desc: (q: TKQuote) => `"${q.trans.en}" — ${personName(q.person, 'en')} (${q.hanmun}). The story behind the quote and its source (${q.srcName.en}).`,
    orig: 'Original', trans: 'Translation', context: 'The scene behind the words', source: 'Source', person: 'Speaker',
    more: 'More quotes from this person', all: 'Browse all Three Kingdoms quotes', save: 'Save quote card',
    charBanner: 'View character profile',
  },
}

export function generateStaticParams() {
  return TK_QUOTES.map((q) => ({ quote: q.slug }))
}

export function generateMetadata({ params }: { params: { lang: string; quote: string } }): Metadata {
  const q = TKQ_BY_SLUG[params.quote]
  if (!q) return {}
  const lang = asTKLang(params.lang)
  const s = S[lang]
  const url = `${BASE}/${lang}/tools/three-kingdoms-quotes/${q.slug}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/three-kingdoms-quotes/${q.slug}`
  languages['x-default'] = `${BASE}/en/tools/three-kingdoms-quotes/${q.slug}`
  return {
    title: { absolute: `${s.title(q)} | ToolBoxy` },
    description: s.desc(q).slice(0, 155),
    alternates: { canonical: url, languages },
    openGraph: { title: s.title(q), description: s.desc(q).slice(0, 155), url, type: 'article' },
  }
}

export default function QuotePage({ params }: { params: { lang: string; quote: string } }) {
  const q = TKQ_BY_SLUG[params.quote]
  if (!q) notFound()
  const lang = asTKLang(params.lang)
  const s = S[lang]
  const src = SRC_META[q.src]
  const others = quotesForPerson(q.person).filter((x) => x.slug !== q.slug).slice(0, 4)
  const order = TK_QUOTES.findIndex((x) => x.slug === q.slug)
  const prev = TK_QUOTES[(order - 1 + TK_QUOTES.length) % TK_QUOTES.length]
  const next = TK_QUOTES[(order + 1) % TK_QUOTES.length]
  const hasChar = !!TKC_BY_ID[q.person]

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Quotation',
    text: q.trans[lang],
    spokenByCharacter: { '@type': 'Person', name: personName(q.person, lang), alternateName: personHanja(q.person) },
    url: `${BASE}/${lang}/tools/three-kingdoms-quotes/${q.slug}`,
  }

  const chip = 'inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-5">
        <Link href={`/${lang}/tools/three-kingdoms-quotes`} className="hover:text-brand-600">{s.all}</Link>
      </nav>

      {/* the quote */}
      <div className="text-center mb-6">
        <TKSrcBadge src={q.src} lang={lang} />
        <p className="mt-4 text-3xl font-black text-gray-900 font-serif leading-snug">{q.hanmun}</p>
        <p className="mt-4 text-lg text-gray-700 leading-relaxed">“{q.trans[lang]}”</p>
        <p className="mt-3 text-sm font-bold text-gray-500">
          — {hasChar
            ? <Link href={`/${lang}/tools/three-kingdoms-characters/${q.person}`} className="text-brand-600 hover:underline">{personName(q.person, lang)}</Link>
            : personName(q.person, lang)}
          <span className="ml-1.5 font-serif font-normal text-gray-400">{personHanja(q.person)}</span>
        </p>
        <div className="mt-4 flex justify-center">
          <TKQuoteCard hanmun={q.hanmun} trans={q.trans[lang]} person={personName(q.person, lang)}
            hanja={personHanja(q.person)} color={src.color} label={s.save} />
        </div>
      </div>

      {/* other-language renderings */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-4 space-y-1">
        {(['ko', 'ja', 'en'] as TKLang[]).filter((l) => l !== lang).map((l) => (
          <p key={l} className="text-xs text-gray-500"><span className="font-bold uppercase mr-1.5">{l}</span>{q.trans[l]}</p>
        ))}
      </div>

      {/* context */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.context}</h2>
        <p className="text-gray-700 leading-relaxed text-[15px]">{q.context[lang]}</p>
        <p className="mt-3 text-xs text-gray-400">{s.source}: <span className="font-medium text-gray-500">{q.srcName[lang]}</span></p>
      </section>

      {/* more from this person */}
      {others.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-2">{s.more}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/${lang}/tools/three-kingdoms-quotes/${o.slug}`} className={chip}>{o.gist[lang]}</Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-between text-sm mb-6">
        <Link href={`/${lang}/tools/three-kingdoms-quotes/${prev.slug}`} className="text-gray-500 hover:text-brand-600">← {prev.gist[lang]}</Link>
        <Link href={`/${lang}/tools/three-kingdoms-quotes/${next.slug}`} className="text-gray-500 hover:text-brand-600 text-right">{next.gist[lang]} →</Link>
      </div>

      {hasChar && (
        <Link href={`/${lang}/tools/three-kingdoms-characters/${q.person}`}
          className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
          👤 {personName(q.person, lang)} — {s.charBanner}
        </Link>
      )}
    </main>
  )
}
