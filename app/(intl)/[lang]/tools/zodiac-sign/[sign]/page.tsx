import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ZODIAC_SIGNS, SIGN_BY_ID, zName, zDesc, zTraits, type ZodiacSign } from '@/lib/zodiac'

// Longtail pages, one per western zodiac sign ("물병자리 성격", "물병자리 기간"…).
// Dates/elements/planets are standard; personality & compatibility are our own plain
// renderings of the TRADITIONAL lore, framed as such (nothing presented as fact).

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dateRange = (s: ZodiacSign, lang: string) => {
  const [sm, sd] = s.start; const [em, ed] = s.end
  if (lang === 'ko') return `${sm}월 ${sd}일 ~ ${em}월 ${ed}일`
  if (lang === 'ja') return `${sm}月${sd}日〜${em}月${ed}日`
  return `${EN_MONTHS[sm - 1]} ${sd} – ${EN_MONTHS[em - 1]} ${ed}`
}

const LBL: Record<string, Record<string, string>> = {
  ko: { period: '기간', element: '원소', planet: '지배 행성', traits: '성격 키워드', personality: '성격', goodWith: '잘 맞는 별자리', all: '12별자리', disclaimer: '별자리의 성격·궁합은 서양 점성술에서 전통적으로 전해지는 이야기입니다. 재미로 봐 주세요.', fire: '불', earth: '흙', air: '공기', water: '물' },
  ja: { period: '期間', element: 'エレメント', planet: '守護星', traits: '性格キーワード', personality: '性格', goodWith: '相性のいい星座', all: '十二星座', disclaimer: '星座の性格・相性は西洋占星術で伝統的に語られてきた内容です。娯楽としてお楽しみください。', fire: '火', earth: '地', air: '風', water: '水' },
  en: { period: 'Dates', element: 'Element', planet: 'Ruling planet', traits: 'Trait keywords', personality: 'Personality', goodWith: 'Most compatible with', all: 'All 12 signs', disclaimer: 'Sign personalities and compatibility reflect traditional Western astrology lore — enjoy them for fun.', fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' },
}

const S = {
  ko: {
    title: (s: ZodiacSign) => `${s.name.ko} 성격·기간·궁합 (${dateRange(s, 'ko')})`,
    desc: (s: ZodiacSign) => `${s.name.ko}(${dateRange(s, 'ko')})의 성격, 원소·지배 행성, 잘 맞는 별자리까지 한 페이지에서 확인하세요. ${s.desc.ko}`,
    faq: (s: ZodiacSign) => [
      [`${s.name.ko} 기간은 언제인가요?`, `${s.name.ko}는 ${dateRange(s, 'ko')} 사이에 태어난 사람의 별자리입니다.`],
      [`${s.name.ko} 성격은?`, s.desc.ko],
      [`${s.name.ko}와 잘 맞는 별자리는?`, `전통적으로 ${s.goodWith.map((g) => SIGN_BY_ID[g].name.ko).join(', ')}와 잘 어울린다고 이야기됩니다.`],
    ] as [string, string][],
  },
  ja: {
    title: (s: ZodiacSign) => `${s.name.ja}の性格・期間・相性 (${dateRange(s, 'ja')})`,
    desc: (s: ZodiacSign) => `${s.name.ja}(${dateRange(s, 'ja')})の性格、エレメント・守護星、相性のいい星座まで1ページで確認できます。${s.desc.ja}`,
    faq: (s: ZodiacSign) => [
      [`${s.name.ja}の期間はいつですか？`, `${s.name.ja}は${dateRange(s, 'ja')}に生まれた人の星座です。`],
      [`${s.name.ja}の性格は？`, s.desc.ja],
      [`${s.name.ja}と相性のいい星座は？`, `伝統的に${s.goodWith.map((g) => SIGN_BY_ID[g].name.ja).join('、')}と相性がいいといわれます。`],
    ] as [string, string][],
  },
  en: {
    title: (s: ZodiacSign) => `${s.name.en} Personality, Dates & Compatibility (${dateRange(s, 'en')})`,
    desc: (s: ZodiacSign) => `${s.name.en} (${dateRange(s, 'en')}): personality, element, ruling planet and most compatible signs on one page. ${s.desc.en}`,
    faq: (s: ZodiacSign) => [
      [`What are the ${s.name.en} dates?`, `${s.name.en} is the sign of people born between ${dateRange(s, 'en')}.`],
      [`What is the ${s.name.en} personality like?`, s.desc.en],
      [`Which signs are most compatible with ${s.name.en}?`, `Traditionally ${s.goodWith.map((g) => SIGN_BY_ID[g].name.en).join(', ')} are said to pair well.`],
    ] as [string, string][],
  },
}
const pick = <T,>(m: Record<string, T>, lang: string): T => m[lang === 'ko' ? 'ko' : lang === 'ja' ? 'ja' : 'en']

export function generateStaticParams() {
  return ZODIAC_SIGNS.map((s) => ({ sign: s.id }))
}

export async function generateMetadata({ params }: { params: { lang: string; sign: string } }): Promise<Metadata> {
  const s = SIGN_BY_ID[params.sign.toLowerCase()]
  if (!s) return {}
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const st = pick(S, lang)
  const title = `${st.title(s)} | ToolBoxy`
  const description = st.desc(s).slice(0, 155)
  const url = `${BASE}/${lang}/tools/zodiac-sign/${s.id}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/zodiac-sign/${s.id}`
  languages['x-default'] = `${BASE}/en/tools/zodiac-sign/${s.id}`
  return { title: { absolute: title }, description, alternates: { canonical: url, languages }, openGraph: { title, description, url, type: 'article' } }
}

export default function ZodiacSignDetail({ params }: { params: { lang: string; sign: string } }) {
  const s = SIGN_BY_ID[params.sign.toLowerCase()]
  if (!s) notFound()
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const l = pick(LBL, lang)
  const st = pick(S, lang)
  const faq = st.faq(s)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-2.5 flex gap-3 items-baseline"><span className="text-sm text-gray-400 w-24 shrink-0">{label}</span><span className="text-gray-800 min-w-0">{children}</span></div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${lang}/tools/zodiac-sign`} className="hover:text-brand-600">← {lang === 'ko' ? '별자리 찾기' : lang === 'ja' ? '星座を調べる' : 'Zodiac Sign Finder'}</Link>
      </nav>

      <div className="text-center py-8 rounded-2xl border-2 border-gray-100">
        <div className="text-7xl leading-none">{s.emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{zName(s, lang)}</h1>
        <p className="text-sm text-gray-500 mt-1">{dateRange(s, lang)}</p>
      </div>

      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label={l.period}><b>{dateRange(s, lang)}</b></Row>
        <Row label={l.element}>{l[s.element]}</Row>
        <Row label={l.planet}>{pick(s.planet as unknown as Record<string, string>, lang)}</Row>
        <Row label={l.traits}>
          <span className="flex flex-wrap gap-1.5">
            {zTraits(s, lang).map((tr) => <span key={tr} className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-sm">{tr}</span>)}
          </span>
        </Row>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-1.5">{l.personality}</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{zDesc(s, lang)}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.goodWith}</h2>
        <div className="flex flex-wrap gap-2">
          {s.goodWith.map((g) => {
            const x = SIGN_BY_ID[g]
            return (
              <Link key={g} href={`/${lang}/tools/zodiac-sign/${g}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">
                <span>{x.emoji}</span>{zName(x, lang)}
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.all}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {ZODIAC_SIGNS.map((x) => (
            <Link key={x.id} href={`/${lang}/tools/zodiac-sign/${x.id}`}
              className={'flex flex-col items-center py-2 rounded-xl border text-center ' + (x.id === s.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600 hover:border-brand-300')}>
              <span className="text-xl">{x.emoji}</span>
              <span className="text-xs mt-0.5">{zName(x, lang)}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">{l.disclaimer}</p>
    </div>
  )
}
