import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TK_BATTLES, TKB_BY_ID, type TKBattle } from '@/lib/tools/threeKingdomsBattles'
import { TKC_BY_ID } from '@/lib/tools/threeKingdomsCharacters'
import { TKI_BY_SLUG, tkiName } from '@/lib/tools/threeKingdomsIdioms'
import { asTKLang, type TKLang } from '@/lib/tools/tkCommon'
import { TKSrcBadge, TKFactionBadge } from '@/components/tools/TKBadge'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const S = {
  ko: {
    title: (b: TKBattle) => `${b.name.ko} 정리 - 배경 전개 결과 (${b.year}년)`,
    desc: (b: TKBattle) => `${b.name.ko}(${b.year}) 완전 정리: ${b.background.ko.split('.')[0]}. 배경·전개·결과와 정사/연의 차이까지 한 페이지에.`,
    year: '연도', sides: '교전 세력', background: '배경', course: '전개', outcome: '결과와 영향',
    diff: '정사와 연의의 차이', idioms: '이 전투에서 나온 고사성어', all: '삼국지 전투 사전 전체 보기',
    timeline: '연표에서 보기', prevB: '이전 전투', nextB: '다음 전투',
  },
  ja: {
    title: (b: TKBattle) => `${b.name.ja}をわかりやすく解説 - 背景・経過・結果（${b.year}年）`,
    desc: (b: TKBattle) => `${b.name.ja}（${b.year}）完全解説: ${b.background.ja.split('。')[0]}。背景・経過・結果、正史と演義の違いまで1ページで。`,
    year: '年', sides: '交戦勢力', background: '背景', course: '経過', outcome: '結果と影響',
    diff: '正史と演義の違い', idioms: 'この戦いから生まれた故事成語', all: '三国志の戦いをすべて見る',
    timeline: '年表で見る', prevB: '前の戦い', nextB: '次の戦い',
  },
  en: {
    title: (b: TKBattle) => `Battle of ${b.name.en.replace(/^Battle of /, '').replace(/^The /, '')} Explained (${b.year})`,
    desc: (b: TKBattle) => `${b.name.en} (${b.year}) explained: ${b.background.en.split('.')[0]}. Background, course, outcome — and how the novel differs from history.`,
    year: 'Year', sides: 'Belligerents', background: 'Background', course: 'Course', outcome: 'Outcome & impact',
    diff: 'History vs. the novel', idioms: 'Idioms born in this battle', all: 'Browse all Three Kingdoms battles',
    timeline: 'View on the timeline', prevB: 'Previous battle', nextB: 'Next battle',
  },
}

export function generateStaticParams() {
  return TK_BATTLES.map((b) => ({ battle: b.id }))
}

export function generateMetadata({ params }: { params: { lang: string; battle: string } }): Metadata {
  const b = TKB_BY_ID[params.battle]
  if (!b) return {}
  const lang = asTKLang(params.lang)
  const s = S[lang]
  const url = `${BASE}/${lang}/tools/three-kingdoms-battles/${b.id}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/three-kingdoms-battles/${b.id}`
  languages['x-default'] = `${BASE}/en/tools/three-kingdoms-battles/${b.id}`
  return {
    title: { absolute: `${s.title(b)} | ToolBoxy` },
    description: s.desc(b).slice(0, 155),
    alternates: { canonical: url, languages },
    openGraph: { title: s.title(b), description: s.desc(b).slice(0, 155), url, type: 'article' },
  }
}

export default function BattlePage({ params }: { params: { lang: string; battle: string } }) {
  const b = TKB_BY_ID[params.battle]
  if (!b) notFound()
  const lang = asTKLang(params.lang)
  const s = S[lang]
  const idx = TK_BATTLES.findIndex((x) => x.id === b.id)
  const prev = idx > 0 ? TK_BATTLES[idx - 1] : null
  const next = idx < TK_BATTLES.length - 1 ? TK_BATTLES[idx + 1] : null

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: b.name[lang], startDate: String(b.sortYear),
    description: b.background[lang].split(/[.。]/)[0],
    url: `${BASE}/${lang}/tools/three-kingdoms-battles/${b.id}`,
  }

  const chip = 'inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-5">
        <Link href={`/${lang}/tools/three-kingdoms-battles`} className="hover:text-brand-600">{s.all}</Link>
      </nav>

      {/* header */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-1.5 mb-3">
          {b.factions.map((f) => <TKFactionBadge key={f} faction={f} lang={lang} size="xs" />)}
        </div>
        <h1 className="text-3xl font-black text-gray-900">{b.name[lang]}</h1>
        <p className="text-sm text-gray-400 font-serif mt-1">{b.hanja}</p>
        <p className="text-sm font-bold text-gray-500 mt-1">{s.year}: {b.year}</p>
        <Link href={`/${lang}/tools/three-kingdoms-timeline#y${b.sortYear}`}
          className="inline-block mt-2 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-600 hover:border-brand-200">🕰 {s.timeline}</Link>
      </div>

      {/* belligerents + commanders */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">{s.sides}</h2>
        <div className="grid grid-cols-2 gap-3">
          {b.sides.map((side, i) => (
            <div key={i} className={i === 0 ? 'pr-3 border-r border-gray-100' : 'pl-1'}>
              <p className="text-sm font-bold text-gray-800 mb-1.5">{side.label[lang]}</p>
              <div className="flex flex-wrap gap-1">
                {side.people.map((p) => TKC_BY_ID[p] && (
                  <Link key={p} href={`/${lang}/tools/three-kingdoms-characters/${p}`}
                    className="text-[11px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-600 hover:text-brand-600 hover:border-brand-200">
                    {TKC_BY_ID[p].name[lang]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* background / course / outcome */}
      {([['background', b.background], ['course', b.course], ['outcome', b.outcome]] as const).map(([key, text]) => (
        <section key={key} className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-2">{s[key]}</h2>
          <p className="text-gray-700 leading-relaxed text-[15px]">{text[lang]}</p>
        </section>
      ))}

      {/* history vs novel */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
          {s.diff}
          <TKSrcBadge src="history" lang={lang} size="xs" />
          <span className="text-gray-300">vs</span>
          <TKSrcBadge src="novel" lang={lang} size="xs" />
        </h2>
        <p className="text-gray-700 leading-relaxed text-[15px]">{b.diff[lang]}</p>
      </section>

      {/* related idioms */}
      {b.idioms.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 mb-2">{s.idioms}</h2>
          <div className="flex flex-wrap gap-2">
            {b.idioms.map((slug) => {
              const i = TKI_BY_SLUG[slug]
              return i ? (
                <Link key={slug} href={`/${lang}/tools/three-kingdoms-idioms/${slug}`} className={chip}>
                  {tkiName(i, lang)} <span className="ml-1 text-gray-400 font-serif text-xs">{i.hanja}</span>
                </Link>
              ) : null
            })}
          </div>
        </section>
      )}

      <div className="flex justify-between text-sm">
        {prev ? <Link href={`/${lang}/tools/three-kingdoms-battles/${prev.id}`} className="text-gray-500 hover:text-brand-600">← {prev.name[lang]}</Link> : <span />}
        {next ? <Link href={`/${lang}/tools/three-kingdoms-battles/${next.id}`} className="text-gray-500 hover:text-brand-600 text-right">{next.name[lang]} →</Link> : <span />}
      </div>
    </main>
  )
}
