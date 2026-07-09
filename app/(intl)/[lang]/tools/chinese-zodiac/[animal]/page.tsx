import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ZODIAC_ANIMALS, ANIMAL_BY_ID, animalYears, zName, zDesc, zTraits, type ZodiacAnimal } from '@/lib/zodiac'

// Longtail pages, one per Chinese zodiac animal ("쥐띠 성격", "1990 무슨 띠"…). Years, the
// traditional 삼합/상충 pairings, double-hours and fixed elements are standard tradition;
// personality text is our own plain rendering of the lore, framed as such.

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const LBL: Record<string, Record<string, string>> = {
  ko: { years: '해당 연도', branch: '지지(地支)', hour: '시간(십이시)', element: '오행', traits: '성격 키워드', personality: '성격', trine: '잘 맞는 띠 (삼합)', clash: '상충인 띠', all: '십이지 띠', yearNote: '띠의 기준은 음력 설(입춘)이라, 1~2월 초 출생자는 전년도 띠일 수 있어요.', disclaimer: '띠의 성격·궁합은 민간에서 전통적으로 전해지는 이야기입니다. 재미로 봐 주세요.' },
  ja: { years: '該当する年', branch: '地支', hour: '時刻(十二時辰)', element: '五行', traits: '性格キーワード', personality: '性格', trine: '相性のいい干支 (三合)', clash: '相性が難しい干支 (冲)', all: '十二支', yearNote: '干支の切り替わりは旧正月(立春)基準のため、1〜2月初め生まれは前年の干支になることがあります。', disclaimer: '干支の性格・相性は民間で伝統的に語られてきた内容です。娯楽としてお楽しみください。' },
  en: { years: 'Years', branch: 'Earthly branch', hour: 'Double-hour', element: 'Fixed element', traits: 'Trait keywords', personality: 'Personality', trine: 'Best matches (trine)', clash: 'Clashing sign', all: 'All 12 animals', yearNote: 'The zodiac year changes at Lunar New Year, so people born in January–early February may belong to the previous year’s animal.', disclaimer: 'Animal personalities and compatibility reflect traditional folklore — enjoy them for fun.' },
}

const S = {
  ko: {
    title: (a: ZodiacAnimal, ys: number[]) => `${a.name.ko} 성격·연도·궁합 (${ys.slice(-5).join('·')}년생)`,
    desc: (a: ZodiacAnimal, ys: number[]) => `${ys.slice(-6).join(', ')}년생은 ${a.name.ko}입니다. ${a.name.ko}의 성격과 잘 맞는 띠(삼합), 오행·시간까지 한 페이지에서 확인하세요.`,
    faq: (a: ZodiacAnimal, ys: number[]) => [
      [`${a.name.ko}는 몇 년생인가요?`, `${ys.join(', ')}년생이 ${a.name.ko}입니다. 설날(입춘) 이전 출생자는 전년도 띠일 수 있어요.`],
      [`${a.name.ko} 성격은?`, a.desc.ko],
      [`${a.name.ko}와 잘 맞는 띠는?`, `전통적으로 삼합인 ${a.trine.map((x) => ANIMAL_BY_ID[x].name.ko).join(', ')}와 잘 맞고, ${ANIMAL_BY_ID[a.clash].name.ko}와는 상충이라고 이야기됩니다.`],
    ] as [string, string][],
  },
  ja: {
    title: (a: ZodiacAnimal, ys: number[]) => `${a.name.ja}の性格・年・相性 (${ys.slice(-5).join('・')}年生まれ)`,
    desc: (a: ZodiacAnimal, ys: number[]) => `${ys.slice(-6).join('、')}年生まれは${a.name.ja}です。${a.name.ja}の性格、相性のいい干支(三合)、五行・時刻まで1ページで確認できます。`,
    faq: (a: ZodiacAnimal, ys: number[]) => [
      [`${a.name.ja}は何年生まれですか？`, `${ys.join('、')}年生まれが${a.name.ja}です。旧正月(立春)より前の生まれは前年の干支になることがあります。`],
      [`${a.name.ja}の性格は？`, a.desc.ja],
      [`${a.name.ja}と相性のいい干支は？`, `伝統的に三合の${a.trine.map((x) => ANIMAL_BY_ID[x].name.ja).join('、')}と相性がよく、${ANIMAL_BY_ID[a.clash].name.ja}とは冲といわれます。`],
    ] as [string, string][],
  },
  en: {
    title: (a: ZodiacAnimal, ys: number[]) => `Year of the ${a.name.en} — Personality, Years & Compatibility`,
    desc: (a: ZodiacAnimal, ys: number[]) => `Born in ${ys.slice(-6).join(', ')}? That's the Year of the ${a.name.en}. Personality, best matches (trine), fixed element and double-hour on one page.`,
    faq: (a: ZodiacAnimal, ys: number[]) => [
      [`Which years are the Year of the ${a.name.en}?`, `${ys.join(', ')}. People born before Lunar New Year may belong to the previous year's animal.`],
      [`What is the ${a.name.en} personality like?`, a.desc.en],
      [`Which animals match the ${a.name.en} best?`, `Traditionally its trine partners ${a.trine.map((x) => ANIMAL_BY_ID[x].name.en).join(' and ')} pair well, while the ${ANIMAL_BY_ID[a.clash].name.en} is said to clash.`],
    ] as [string, string][],
  },
}
const pick = <T,>(m: Record<string, T>, lang: string): T => m[lang === 'ko' ? 'ko' : lang === 'ja' ? 'ja' : 'en']

export function generateStaticParams() {
  return ZODIAC_ANIMALS.map((a) => ({ animal: a.id }))
}

export async function generateMetadata({ params }: { params: { lang: string; animal: string } }): Promise<Metadata> {
  const a = ANIMAL_BY_ID[params.animal.toLowerCase()]
  if (!a) return {}
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const ys = animalYears(a.order, 1960, 2032)
  const st = pick(S, lang)
  const title = `${st.title(a, ys)} | ToolBoxy`
  const description = st.desc(a, ys).slice(0, 155)
  const url = `${BASE}/${lang}/tools/chinese-zodiac/${a.id}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/chinese-zodiac/${a.id}`
  languages['x-default'] = `${BASE}/en/tools/chinese-zodiac/${a.id}`
  return { title: { absolute: title }, description, alternates: { canonical: url, languages }, openGraph: { title, description, url, type: 'article' } }
}

export default function ChineseZodiacDetail({ params }: { params: { lang: string; animal: string } }) {
  const a = ANIMAL_BY_ID[params.animal.toLowerCase()]
  if (!a) notFound()
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const l = pick(LBL, lang)
  const st = pick(S, lang)
  const years = animalYears(a.order, 1936, 2043)
  const faq = st.faq(a, animalYears(a.order, 1960, 2032))
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-2.5 flex gap-3 items-baseline"><span className="text-sm text-gray-400 w-28 shrink-0">{label}</span><span className="text-gray-800 min-w-0">{children}</span></div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${lang}/tools/chinese-zodiac`} className="hover:text-brand-600">← {lang === 'ko' ? '띠 찾기' : lang === 'ja' ? '干支を調べる' : 'Chinese Zodiac Finder'}</Link>
      </nav>

      <div className="text-center py-8 rounded-2xl border-2 border-gray-100">
        <div className="text-7xl leading-none">{a.emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{zName(a, lang)} <span className="text-gray-400 font-normal" style={{ fontFamily: 'serif' }}>{a.hanja}</span></h1>
      </div>

      {/* years grid — the "1990 무슨 띠" answer */}
      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.years}</h2>
        <div className="flex flex-wrap gap-1.5">
          {years.map((y) => <span key={y} className="px-2 py-1 rounded-lg bg-gray-50 text-sm text-gray-700 tabular-nums">{y}</span>)}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">{l.yearNote}</p>
      </div>

      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label={l.branch}><span style={{ fontFamily: 'serif' }} className="text-lg">{a.hanja}</span></Row>
        <Row label={l.element}>{pick(a.element as unknown as Record<string, string>, lang)}</Row>
        <Row label={l.hour}><span className="tabular-nums">{a.hour}</span></Row>
        <Row label={l.traits}>
          <span className="flex flex-wrap gap-1.5">
            {zTraits(a, lang).map((tr) => <span key={tr} className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-sm">{tr}</span>)}
          </span>
        </Row>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-1.5">{l.personality}</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{zDesc(a, lang)}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.trine}</h2>
          <div className="flex flex-wrap gap-2">
            {a.trine.map((x) => {
              const p = ANIMAL_BY_ID[x]
              return <Link key={x} href={`/${lang}/tools/chinese-zodiac/${x}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600"><span>{p.emoji}</span>{zName(p, lang)}</Link>
            })}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.clash}</h2>
          <Link href={`/${lang}/tools/chinese-zodiac/${a.clash}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">
            <span>{ANIMAL_BY_ID[a.clash].emoji}</span>{zName(ANIMAL_BY_ID[a.clash], lang)}
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{l.all}</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {ZODIAC_ANIMALS.map((x) => (
            <Link key={x.id} href={`/${lang}/tools/chinese-zodiac/${x.id}`}
              className={'flex flex-col items-center py-2 rounded-xl border text-center ' + (x.id === a.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600 hover:border-brand-300')}>
              <span className="text-xl">{x.emoji}</span>
              <span className="text-[11px] mt-0.5">{zName(x, lang)}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">{l.disclaimer}</p>
    </div>
  )
}
