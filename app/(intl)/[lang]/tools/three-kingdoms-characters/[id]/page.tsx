import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TK_CHARS, TKC_BY_ID, ROLE_LABEL, type TKChar } from '@/lib/tools/threeKingdomsCharacters'
import { eventsForPerson } from '@/lib/tools/threeKingdomsEvents'
import { TK_IDIOMS, tkiName } from '@/lib/tools/threeKingdomsIdioms'
import { FACTION_META, SRC_META, asTKLang, type TKLang } from '@/lib/tools/tkCommon'
import { TKSrcBadge, TKFactionBadge } from '@/components/tools/TKBadge'

// 허브 도구: 인물 개별 페이지. 성어(향후 명언·전투)의 역링크가 여기로 모인다.

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const S = {
  ko: {
    title: (c: TKChar) => `${c.name.ko} - 삼국지 인물 사전 (자·생몰년·주요 사건)`,
    desc: (c: TKChar) => `${c.name.ko}(${c.hanja}${c.courtesy ? ', 자 ' + c.courtesy.read.ko : ''}) — ${c.birth}~${c.death}. ${c.intro.ko.split('.')[0]}.`,
    life: '생몰년', courtesy: '자', posthumous: '시호', faction: '세력', factionHist: '세력 변천', role: '구분',
    intro: '소개', events: '주요 사건', imageDiff: '정사와 연의의 차이', idioms: '관련 고사성어',
    related: '같은 세력 인물', all: '삼국지 인물 사전 전체 보기', fictional: '연의 창작 인물',
    testBanner: '나와 닮은 삼국지 장수는? — 인물 테스트', idiomsBanner: '삼국지 고사성어 사전',
  },
  ja: {
    title: (c: TKChar) => `${c.name.ja}とは - 三国志人物事典`,
    desc: (c: TKChar) => `${c.name.ja}（${c.hanja}${c.courtesy ? '、字は' + c.courtesy.read.ja : ''}） — ${c.birth}〜${c.death}。${c.intro.ja.split('。')[0]}。`,
    life: '生没年', courtesy: '字', posthumous: '諡号', faction: '勢力', factionHist: '勢力の変遷', role: '区分',
    intro: '紹介', events: '主な出来事', imageDiff: '正史と演義の違い', idioms: '関連する故事成語',
    related: '同じ勢力の人物', all: '三国志人物事典をすべて見る', fictional: '演義の創作人物',
    testBanner: 'あなたに似ている武将は？ — 性格診断', idiomsBanner: '三国志の故事成語辞典',
  },
  en: {
    title: (c: TKChar) => `${c.name.en} - Three Kingdoms Character Profile`,
    desc: (c: TKChar) => `${c.name.en} (${c.hanja}${c.courtesy ? ', courtesy name ' + c.courtesy.read.en : ''}) — ${c.birth}–${c.death}. ${c.intro.en.split('.')[0]}.`,
    life: 'Lived', courtesy: 'Courtesy name', posthumous: 'Posthumous', faction: 'Faction', factionHist: 'Allegiances', role: 'Role',
    intro: 'Profile', events: 'Key events', imageDiff: 'History vs. the novel', idioms: 'Related idioms',
    related: 'Same faction', all: 'Browse all Three Kingdoms characters', fictional: 'Fictional (novel only)',
    testBanner: 'Which hero are you? — Take the test', idiomsBanner: 'Three Kingdoms idioms dictionary',
  },
}

export function generateStaticParams() {
  return TK_CHARS.map((c) => ({ id: c.id }))
}

export function generateMetadata({ params }: { params: { lang: string; id: string } }): Metadata {
  const c = TKC_BY_ID[params.id]
  if (!c) return {}
  const lang = asTKLang(params.lang)
  const s = S[lang]
  const url = `${BASE}/${lang}/tools/three-kingdoms-characters/${c.id}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/three-kingdoms-characters/${c.id}`
  languages['x-default'] = `${BASE}/en/tools/three-kingdoms-characters/${c.id}`
  return {
    title: { absolute: `${s.title(c)} | ToolBoxy` },
    description: s.desc(c).slice(0, 155),
    alternates: { canonical: url, languages },
    openGraph: { title: s.title(c), description: s.desc(c).slice(0, 155), url, type: 'article' },
  }
}

export default function CharacterPage({ params }: { params: { lang: string; id: string } }) {
  const c = TKC_BY_ID[params.id]
  if (!c) notFound()
  const lang: TKLang = asTKLang(params.lang)
  const s = S[lang]
  const events = eventsForPerson(c.id)
  const idioms = TK_IDIOMS.filter((i) => i.people.includes(c.id))
  const related = TK_CHARS.filter((x) => x.id !== c.id && x.faction === c.faction).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: c.name[lang], alternateName: c.hanja,
    description: c.intro[lang].split(/[.。]/)[0],
    url: `${BASE}/${lang}/tools/three-kingdoms-characters/${c.id}`,
  }

  const chip = 'inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors'
  const fMeta = FACTION_META[c.faction]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-5">
        <Link href={`/${lang}/tools/three-kingdoms-characters`} className="hover:text-brand-600">{s.all}</Link>
      </nav>

      {/* header */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-1.5 mb-3">
          <TKFactionBadge faction={c.faction} lang={lang} />
          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">{ROLE_LABEL[c.role][lang]}</span>
          {c.fictional && <TKSrcBadge src="novel" lang={lang} />}
        </div>
        <h1 className="text-4xl font-black text-gray-900 font-serif">{c.hanja}</h1>
        <p className="text-xl font-bold text-gray-700 mt-1">{c.name[lang]}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {c.courtesy && <span>{s.courtesy}: {c.courtesy.hanja} ({c.courtesy.read[lang]})</span>}
          {c.posthumous && <span>{s.posthumous}: {c.posthumous[lang]}</span>}
          <span>{s.life}: {c.birth} ~ {c.death}</span>
        </div>
        {c.factionNote && <p className="mt-1.5 text-xs text-gray-400">{s.factionHist}: {c.factionNote[lang]}</p>}
        {c.fictional && <p className="mt-1.5 text-xs font-semibold" style={{ color: SRC_META.novel.color }}>※ {s.fictional}</p>}
      </div>

      {/* intro */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2">{s.intro}</h2>
        <p className="text-gray-700 leading-relaxed text-[15px]">{c.intro[lang]}</p>
      </section>

      {/* key events (shared with the timeline dataset) */}
      {events.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-3">{s.events}</h2>
          <ol className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="shrink-0 w-11 text-right text-sm font-bold tabular-nums" style={{ color: fMeta.color }}>{e.year}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {e.title[lang]}
                    {e.src === 'novel' && <span className="ml-1.5 align-middle"><TKSrcBadge src="novel" lang={lang} size="xs" /></span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{e.desc[lang]}</p>
                  {e.people.filter((p) => p !== c.id && TKC_BY_ID[p]).length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-1">
                      {e.people.filter((p) => p !== c.id && TKC_BY_ID[p]).map((p) => (
                        <Link key={p} href={`/${lang}/tools/three-kingdoms-characters/${p}`}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-500 hover:text-brand-600 hover:border-brand-200">
                          {TKC_BY_ID[p].name[lang]}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* history vs novel */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
          {s.imageDiff}
          <TKSrcBadge src="history" lang={lang} size="xs" />
          <span className="text-gray-300">vs</span>
          <TKSrcBadge src="novel" lang={lang} size="xs" />
        </h2>
        <p className="text-gray-700 leading-relaxed text-[15px]">{c.imageDiff[lang]}</p>
      </section>

      {/* backlinks: idioms (quotes/battles auto-join in later batches) */}
      {idioms.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-2">{s.idioms}</h2>
          <div className="flex flex-wrap gap-2">
            {idioms.map((i) => (
              <Link key={i.slug} href={`/${lang}/tools/three-kingdoms-idioms/${i.slug}`} className={chip}>
                {tkiName(i, lang)} <span className="ml-1 text-gray-400 font-serif text-xs">{i.hanja}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* related same-faction characters */}
      {related.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 mb-2">{s.related}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.id} href={`/${lang}/tools/three-kingdoms-characters/${r.id}`} className={chip}>
                {r.name[lang]} <span className="ml-1 text-gray-400 font-serif text-xs">{r.hanja}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-2 min-[480px]:grid-cols-2">
        <Link href={`/${lang}/tools/three-kingdoms-test`}
          className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
          ⚔️ {s.testBanner}
        </Link>
        <Link href={`/${lang}/tools/three-kingdoms-idioms`}
          className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
          📜 {s.idiomsBanner}
        </Link>
      </div>
    </main>
  )
}
