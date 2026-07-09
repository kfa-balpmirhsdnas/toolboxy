import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ELEMENTS, ELEMENT_BY_SLUG, elementSlug, type Element } from '@/lib/elements'
import { ELEMENT_DETAIL } from '@/lib/elements-detail'
import BohrModel from '@/components/tools/BohrModel'

// Longtail SEO pages: one static page per element ("헬륨 원자번호", "금 원소기호"…).
// All facts come from lib/elements(-detail).ts — reference data only, nothing generated.

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const COLORS: Record<string, string> = {
  nonmetal: '#86efac', noble: '#c4b5fd', alkali: '#fca5a5', alkaline: '#fdba74',
  metalloid: '#5eead4', halogen: '#fde047', transition: '#93c5fd', 'post-transition': '#cbd5e1',
  lanthanide: '#f9a8d4', actinide: '#fda4af',
}

const name = (e: Element, lang: string) => (lang === 'ko' ? e.ko : lang === 'ja' ? e.ja : e.en)

// Page sentences (server component → tiny inline dictionary keyed by lang, like the idiom pages).
const S = {
  ko: {
    title: (e: Element) => `${e.ko}(${e.sym}) — 원자번호 ${e.n} · 원자량 ${e.mass}`,
    desc: (e: Element, cat: string, use: string) => `${e.ko}(${e.sym})의 원자번호는 ${e.n}, 표준 원자량은 ${e.mass}입니다. ${cat}, ${e.group}족 ${e.period}주기. ${use}`,
    faqNum: (e: Element) => [`${e.ko}의 원자번호는?`, `${e.ko}(${e.sym})의 원자번호는 ${e.n}입니다.`],
    faqSym: (e: Element) => [`${e.ko}의 원소 기호는?`, `${e.ko}의 원소 기호는 ${e.sym}입니다.`],
    faqMass: (e: Element) => [`${e.ko}의 원자량은?`, `${e.ko}(${e.sym})의 표준 원자량은 ${e.mass}입니다.`],
  },
  en: {
    title: (e: Element) => `${e.en} (${e.sym}) — Atomic Number ${e.n} · Atomic Mass ${e.mass}`,
    desc: (e: Element, cat: string, use: string) => `${e.en} (${e.sym}) has atomic number ${e.n} and a standard atomic weight of ${e.mass}. ${cat}, group ${e.group}, period ${e.period}. ${use}`,
    faqNum: (e: Element) => [`What is the atomic number of ${e.en}?`, `${e.en} (${e.sym}) has atomic number ${e.n}.`],
    faqSym: (e: Element) => [`What is the symbol for ${e.en}?`, `The chemical symbol for ${e.en} is ${e.sym}.`],
    faqMass: (e: Element) => [`What is the atomic mass of ${e.en}?`, `The standard atomic weight of ${e.en} (${e.sym}) is ${e.mass}.`],
  },
  ja: {
    title: (e: Element) => `${e.ja}(${e.sym}) — 原子番号${e.n}・原子量${e.mass}`,
    desc: (e: Element, cat: string, use: string) => `${e.ja}(${e.sym})の原子番号は${e.n}、標準原子量は${e.mass}です。${cat}、第${e.group}族・第${e.period}周期。${use}`,
    faqNum: (e: Element) => [`${e.ja}の原子番号は？`, `${e.ja}(${e.sym})の原子番号は${e.n}です。`],
    faqSym: (e: Element) => [`${e.ja}の元素記号は？`, `${e.ja}の元素記号は${e.sym}です。`],
    faqMass: (e: Element) => [`${e.ja}の原子量は？`, `${e.ja}(${e.sym})の標準原子量は${e.mass}です。`],
  },
}
const strFor = (lang: string) => (lang === 'ko' ? S.ko : lang === 'ja' ? S.ja : S.en)

export function generateStaticParams() {
  return ELEMENTS.map((e) => ({ element: elementSlug(e) }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function messages(lang: string): Promise<{ toolui: Record<string, any>; toolNames: Record<string, string> }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = (await import(`../../../../../../locales/${lang}/common.json`)).default as any
    return { toolui: j.toolui || {}, toolNames: j.toolNames || {} }
  } catch { return { toolui: {}, toolNames: {} } }
}

export async function generateMetadata({ params }: { params: { lang: string; element: string } }): Promise<Metadata> {
  const e = ELEMENT_BY_SLUG[params.element.toLowerCase()]
  if (!e) return {}
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const { toolui: t } = await messages(lang)
  const d = ELEMENT_DETAIL[e.n]
  const st = strFor(lang)
  const catLabel = t['pt_c_' + e.cat.replace(/-/g, '_')] || e.cat
  const use = (lang === 'ko' ? d?.useKo : lang === 'ja' ? d?.useJa : d?.useEn) || ''
  const title = `${st.title(e)} | ToolBoxy`
  const description = st.desc(e, catLabel, use).slice(0, 155)
  const url = `${BASE}/${lang}/tools/periodic-table/${elementSlug(e)}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/periodic-table/${elementSlug(e)}`
  languages['x-default'] = `${BASE}/en/tools/periodic-table/${elementSlug(e)}`
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, type: 'article' },
  }
}

export default async function ElementPage({ params }: { params: { lang: string; element: string } }) {
  const e = ELEMENT_BY_SLUG[params.element.toLowerCase()]
  if (!e) notFound()
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const { toolui: t, toolNames } = await messages(lang)
  const L = (k: string, fb: string) => (typeof t[k] === 'string' ? t[k] : fb)
  const d = ELEMENT_DETAIL[e.n]
  const st = strFor(lang)
  const catLabel = L('pt_c_' + e.cat.replace(/-/g, '_'), e.cat)
  const use = (lang === 'ko' ? d?.useKo : lang === 'ja' ? d?.useJa : d?.useEn) || ''
  const shellArr = d?.shells ? d.shells.split(',').map((s) => Number(s.trim())).filter((x) => x > 0) : []
  const est = d?.configEstimated ? ` (${L('pt_estimated', '추정')})` : ''
  const stateLabel = d ? L('pt_s_' + d.state, d.state) : ''
  const prev = ELEMENTS.find((x) => x.n === e.n - 1)
  const next = ELEMENTS.find((x) => x.n === e.n + 1)
  const sameGroup = e.group > 0 ? ELEMENTS.filter((x) => x.group === e.group && x.n !== e.n) : []

  const faq = [st.faqNum(e), st.faqSym(e), st.faqMass(e)]
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-2.5 flex gap-3 items-baseline"><span className="text-sm text-gray-400 w-24 shrink-0">{label}</span><span className="text-gray-800 min-w-0">{children}</span></div>
  )
  const tempStr = (v: number | null) => (v == null ? L('pt_nodata', '—') : `${v}°C`)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${lang}/tools/periodic-table`} className="hover:text-brand-600">← {L('pt_title', '주기율표')}</Link>
      </nav>

      {/* hero: category-coloured tile + names */}
      <div className="flex items-center gap-5 py-5 px-5 rounded-2xl border-2 border-gray-100">
        <div className="w-24 h-24 shrink-0 rounded-2xl flex flex-col items-center justify-center shadow-inner" style={{ background: COLORS[e.cat] || '#e5e7eb' }}>
          <span className="text-[11px] font-bold text-gray-700/70 -mb-1">{e.n}</span>
          <span className="text-4xl font-black text-gray-800">{e.sym}</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{name(e, lang)}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{[e.ko, e.en, e.ja].filter((x) => x !== name(e, lang)).join(' · ')}</p>
          <p className="text-xs mt-1.5"><span className="px-2 py-0.5 rounded-full text-gray-700 font-semibold" style={{ background: COLORS[e.cat] || '#e5e7eb' }}>{catLabel}</span></p>
        </div>
      </div>

      {/* fact table — every value is reference data */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label={L('pt_number', '원자번호')}><b>{e.n}</b></Row>
        <Row label={L('mm_element', '원소')}>{e.sym} — {name(e, lang)}</Row>
        <Row label={L('pt_mass', '원자량')}><b>{e.mass}</b></Row>
        <Row label={L('pt_category', '분류')}>{catLabel}</Row>
        <Row label={L('pt_group', '족')}>{e.group > 0 ? e.group : L('pt_nodata', '—')}</Row>
        <Row label={L('pt_period', '주기')}>{e.period}</Row>
        {d && <Row label={L('pt_config', '전자 배치')}><span className="break-all">{d.config}{est}</span></Row>}
        {d && shellArr.length > 0 && <Row label={L('pt_shells', '전자 껍질')}>{d.shells}</Row>}
        {d && <Row label={L('pt_state', '상온 상태')}>{stateLabel}{d.stateEstimated ? ` (${L('pt_estimated', '추정')})` : ''}</Row>}
        {d && <Row label={L('pt_melt', '녹는점')}>{tempStr(d.melt)}</Row>}
        {d && <Row label={L('pt_boil', '끓는점')}>{tempStr(d.boil)}</Row>}
        {d && d.eneg != null && <Row label={L('pt_eneg', '전기음성도')}>{d.eneg}</Row>}
        {d && <Row label={L('pt_discovered', '발견 연도')}>{d.year ?? L('pt_ancient', '고대부터')}</Row>}
        {use && <Row label={L('pt_use', '주요 용도')}>{use}</Row>}
      </div>

      {/* Bohr shell diagram (pure SVG — renders on the server) */}
      {shellArr.length > 0 && (
        <div className="flex flex-col items-center gap-1 py-4 rounded-xl border border-gray-100">
          <BohrModel shells={shellArr} color={COLORS[e.cat] || '#e5e7eb'} symbol={e.sym} number={e.n} size={190} />
          <span className="text-xs text-gray-400">{L('pt_bohr', '보어 모형')}</span>
        </div>
      )}

      {/* prev / next by atomic number */}
      <div className="flex items-center justify-between gap-2">
        {prev ? (
          <Link href={`/${lang}/tools/periodic-table/${elementSlug(prev)}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">← {prev.n}. {name(prev, lang)} ({prev.sym})</Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/${lang}/tools/periodic-table/${elementSlug(next)}`} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 text-right hover:border-brand-400 hover:text-brand-600">{next.n}. {name(next, lang)} ({next.sym}) →</Link>
        ) : <span className="flex-1" />}
      </div>

      {/* same group */}
      {sameGroup.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{L('pt_group', '족')} {e.group}</h2>
          <div className="flex flex-wrap gap-2">
            {sameGroup.map((x) => (
              <Link key={x.n} href={`/${lang}/tools/periodic-table/${elementSlug(x)}`}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600">
                {x.sym} <span className="text-gray-400">{name(x, lang)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* related tools (buttons, per site convention) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {([['periodic-table', '🧪', toolNames['periodic-table'] || 'Periodic Table'], ['molar-mass-calculator', '⚗️', toolNames['molar-mass-calculator'] || 'Molar Mass'], ['element-quiz', '❓', toolNames['element-quiz'] || 'Element Quiz']] as const).map(([slug, icon, label]) => (
          <a key={slug} href={`/${lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
        ))}
      </div>
    </div>
  )
}
