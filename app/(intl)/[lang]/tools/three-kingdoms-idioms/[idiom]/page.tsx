import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  TK_IDIOMS, TKI_BY_SLUG, PEOPLE, SRC_META, tkiName, type TKIdiom, type TKILang,
} from '@/lib/tools/threeKingdomsIdioms'
import TKICopy from '@/components/tools/TKICopy'

// Longtail SEO pages: one static page per idiom ("삼고초려 뜻과 유래", "三顧の礼の意味" …).
// Trilingual content → per-locale canonical + hreflang (elements/countries convention).

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const asLang = (l: string): TKILang => (l === 'ko' || l === 'ja' ? l : 'en')

// Per-language page strings (server component → tiny inline dictionary, like the element pages).
const S = {
  ko: {
    title: (i: TKIdiom) => `${i.ko} 뜻과 유래 - 삼국지 고사성어`,
    desc: (i: TKIdiom) => `${i.ko}(${i.hanja}): ${i.meaning.ko.split('.')[0]}. ${i.people.map((p) => PEOPLE[p].name.ko).join('·')}의 이야기에서 유래한 삼국지 고사성어의 뜻과 유래를 알아보세요.`,
    meaning: '뜻', story: '유래 이야기', source: '출처', people: '관련 인물', ex: '현대 예문',
    rel: '관련 고사성어', all: '삼국지 고사성어 전체 보기', reading: '독음', jaRead: '일본어', pinyin: '병음', enLit: '영어 직역',
    copyH: '한자 복사', copyB: '한자+뜻 복사', copied: '복사됨',
    faqM: (i: TKIdiom) => [`${i.ko}(${i.hanja})의 뜻은?`, i.meaning.ko],
    faqO: (i: TKIdiom) => [`${i.ko}의 유래는?`, i.story.ko.split('.').slice(0, 2).join('.') + '.'],
    banner: '나와 닮은 삼국지 장수는? — 삼국지 인물 테스트 하러 가기',
  },
  ja: {
    title: (i: TKIdiom) => `${tkiName(i, 'ja')}の意味と由来 - 三国志の故事成語`,
    desc: (i: TKIdiom) => `${tkiName(i, 'ja')}（${i.hanja}）: ${i.meaning.ja.split('。')[0]}。${i.people.map((p) => PEOPLE[p].name.ja).join('・')}の物語に由来する三国志の故事成語の意味と由来を解説します。`,
    meaning: '意味', story: '由来の物語', source: '出典', people: '関連人物', ex: '現代の例文',
    rel: '関連する故事成語', all: '三国志の故事成語をすべて見る', reading: '韓国語読み', jaRead: '日本語', pinyin: 'ピンイン', enLit: '英語直訳',
    copyH: '漢字をコピー', copyB: '漢字+意味をコピー', copied: 'コピーしました',
    faqM: (i: TKIdiom) => [`${tkiName(i, 'ja')}（${i.hanja}）の意味は？`, i.meaning.ja],
    faqO: (i: TKIdiom) => [`${tkiName(i, 'ja')}の由来は？`, i.story.ja.split('。').slice(0, 2).join('。') + '。'],
    banner: 'あなたに似ている武将は？ — 三国志性格診断を受けてみる',
  },
  en: {
    title: (i: TKIdiom) => `${i.enLit} (${i.hanja}) Meaning & Origin - Three Kingdoms Idiom`,
    desc: (i: TKIdiom) => `${i.enLit} (${i.hanja}, ${i.pinyin}): ${i.meaning.en.split('.')[0]}. The meaning and origin story of this Three Kingdoms idiom, from the tale of ${i.people.map((p) => PEOPLE[p].name.en).join(' and ')}.`,
    meaning: 'Meaning', story: 'Origin story', source: 'Source', people: 'People', ex: 'Modern examples',
    rel: 'Related idioms', all: 'Browse all Three Kingdoms idioms', reading: 'Korean', jaRead: 'Japanese', pinyin: 'Pinyin', enLit: 'Literal',
    copyH: 'Copy hanja', copyB: 'Copy hanja + meaning', copied: 'Copied',
    faqM: (i: TKIdiom) => [`What does ${i.enLit} (${i.hanja}) mean?`, i.meaning.en],
    faqO: (i: TKIdiom) => [`What is the origin of ${i.enLit}?`, i.story.en.split('.').slice(0, 2).join('.') + '.'],
    banner: 'Which Three Kingdoms hero are you? — Take the personality test',
  },
}

export function generateStaticParams() {
  return TK_IDIOMS.map((i) => ({ idiom: i.slug }))
}

export function generateMetadata({ params }: { params: { lang: string; idiom: string } }): Metadata {
  const i = TKI_BY_SLUG[params.idiom]
  if (!i) return {}
  const lang = asLang(params.lang)
  const s = S[lang]
  const url = `${BASE}/${lang}/tools/three-kingdoms-idioms/${i.slug}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/three-kingdoms-idioms/${i.slug}`
  languages['x-default'] = `${BASE}/en/tools/three-kingdoms-idioms/${i.slug}`
  const title = s.title(i)
  const description = s.desc(i).slice(0, 155)
  return {
    title: { absolute: `${title} | ToolBoxy` },
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, type: 'article' },
  }
}

export default function IdiomPage({ params }: { params: { lang: string; idiom: string } }) {
  const i = TKI_BY_SLUG[params.idiom]
  if (!i) notFound()
  const lang = asLang(params.lang)
  const s = S[lang]
  const src = SRC_META[i.src]
  const order = TK_IDIOMS.findIndex((x) => x.slug === i.slug)
  const prev = TK_IDIOMS[(order - 1 + TK_IDIOMS.length) % TK_IDIOMS.length]
  const next = TK_IDIOMS[(order + 1) % TK_IDIOMS.length]

  // DefinedTerm + FAQPage structured data.
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'DefinedTerm',
      name: tkiName(i, lang), alternateName: i.hanja,
      description: i.meaning[lang],
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: lang === 'ko' ? '삼국지 고사성어' : lang === 'ja' ? '三国志の故事成語' : 'Three Kingdoms Idioms' },
      url: `${BASE}/${lang}/tools/three-kingdoms-idioms/${i.slug}`,
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [s.faqM(i), s.faqO(i)].map(([q, a]) => ({
        '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ]

  const chip = 'inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 mb-5">
        <Link href={`/${lang}/tools/three-kingdoms-idioms`} className="hover:text-brand-600">{s.all}</Link>
      </nav>

      {/* header */}
      <div className="text-center mb-8">
        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-white mb-3" style={{ background: src.color }}>{src.label[lang]}</span>
        <h1 className="text-4xl font-black text-gray-900 font-serif">{i.hanja}</h1>
        <p className="text-xl font-bold text-gray-700 mt-1">{tkiName(i, lang)}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {lang !== 'ko' && <span>{s.reading}: {i.ko}</span>}
          {lang !== 'ja' && <span>{s.jaRead}: {i.ja}</span>}
          <span>{s.pinyin}: {i.pinyin}</span>
          {lang !== 'en' && <span>{s.enLit}: {i.enLit}</span>}
        </div>
        <div className="mt-4 flex justify-center">
          <TKICopy hanja={i.hanja} withMeaning={`${i.hanja} (${tkiName(i, lang)}) — ${i.meaning[lang]}`} labelHanja={s.copyH} labelBoth={s.copyB} labelDone={s.copied} />
        </div>
      </div>

      {/* meaning */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.meaning}</h2>
        <p className="text-gray-800 leading-relaxed">{i.meaning[lang]}</p>
      </section>

      {/* origin story */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.story}</h2>
        <p className="text-gray-700 leading-relaxed text-[15px]">{i.story[lang]}</p>
        <p className="mt-3 text-xs text-gray-400">
          {s.source}: <span className="font-medium text-gray-500">{i.srcName[lang]}</span>
        </p>
      </section>

      {/* people tags */}
      <section className="mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.people}</h2>
        <div className="flex flex-wrap gap-2">
          {i.people.map((p) => (
            <Link key={p} href={`/${lang}/tools/three-kingdoms-idioms?person=${p}`} className={chip}>
              {PEOPLE[p].name[lang]} <span className="ml-1 text-gray-400 font-serif text-xs">{PEOPLE[p].hanja}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* examples */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.ex}</h2>
        <ul className="space-y-2">
          {i.ex.map((e, n) => (
            <li key={n} className="text-gray-700 text-[15px] leading-relaxed pl-3 border-l-2 border-brand-200">{e[lang]}</li>
          ))}
        </ul>
      </section>

      {/* related + prev/next */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.rel}</h2>
        <div className="flex flex-wrap gap-2">
          {i.rel.map((r) => {
            const ri = TKI_BY_SLUG[r]
            return ri ? <Link key={r} href={`/${lang}/tools/three-kingdoms-idioms/${r}`} className={chip}>{tkiName(ri, lang)} <span className="ml-1 text-gray-400 font-serif text-xs">{ri.hanja}</span></Link> : null
          })}
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <Link href={`/${lang}/tools/three-kingdoms-idioms/${prev.slug}`} className="text-gray-500 hover:text-brand-600">← {tkiName(prev, lang)}</Link>
          <Link href={`/${lang}/tools/three-kingdoms-idioms/${next.slug}`} className="text-gray-500 hover:text-brand-600">{tkiName(next, lang)} →</Link>
        </div>
      </section>

      {/* personality test banner */}
      <Link href={`/${lang}/tools/three-kingdoms-test`}
        className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-center font-bold text-brand-700 hover:bg-brand-100 transition-colors">
        ⚔️ {s.banner}
      </Link>
    </main>
  )
}
