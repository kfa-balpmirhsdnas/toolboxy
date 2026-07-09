import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { COUNTRIES, COUNTRY_BY_SLUG, countrySlug, cName, capName, flag, regionName, type Country } from '@/lib/countries'
import { EXTRA, plugName } from '@/lib/country-extra'

// Longtail SEO pages: one static page per country, bundling the facts that are otherwise
// scattered across calling-codes / capital / flag / plug-type / time-difference
// ("프랑스 국가번호", "독일 수도", "일본 콘센트 타입"…). Reference data only.

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

// Page sentences per language (server component → inline dictionary, like the element pages).
const S = {
  ko: {
    title: (c: Country) => `${c.ko} — 국가번호 ${c.dial} · 수도 ${c.cap_ko} · 콘센트 타입`,
    desc: (c: Country, plugs: string) => `${c.ko}의 국가번호는 ${c.dial}, 수도는 ${c.cap_ko}입니다. 인구 약 ${c.pop.toLocaleString('ko')}명${plugs ? `, 콘센트 ${plugs}` : ''}. 시간대·전압·국기까지 한 페이지에.`,
    faq: (c: Country, e?: { plugs: string[]; volt: string; freq: string }) => [
      [`${c.ko}의 국가번호는?`, `${c.ko}의 국제전화 국가번호는 ${c.dial}입니다.`],
      [`${c.ko}의 수도는?`, `${c.ko}의 수도는 ${c.cap_ko}입니다.`],
      ...(e ? [[`${c.ko}의 콘센트 타입은?`, `${c.ko}의 콘센트는 ${e.plugs.join(', ')}타입이며 전압은 ${e.volt} ${e.freq}입니다.`]] : []),
    ] as [string, string][],
  },
  en: {
    title: (c: Country) => `${c.en} — Calling Code ${c.dial} · Capital ${c.cap_en} · Plug Type`,
    desc: (c: Country, plugs: string) => `The calling code of ${c.en} is ${c.dial} and its capital is ${c.cap_en}. Population ≈ ${c.pop.toLocaleString('en')}${plugs ? `, plug types ${plugs}` : ''}. Time zone, voltage and flag on one page.`,
    faq: (c: Country, e?: { plugs: string[]; volt: string; freq: string }) => [
      [`What is the calling code of ${c.en}?`, `The international calling code of ${c.en} is ${c.dial}.`],
      [`What is the capital of ${c.en}?`, `The capital of ${c.en} is ${c.cap_en}.`],
      ...(e ? [[`What plug type does ${c.en} use?`, `${c.en} uses type ${e.plugs.join(', ')} plugs at ${e.volt} ${e.freq}.`]] : []),
    ] as [string, string][],
  },
  ja: {
    title: (c: Country) => `${c.ja} — 国番号${c.dial}・首都${c.cap_ja}・コンセントタイプ`,
    desc: (c: Country, plugs: string) => `${c.ja}の国番号は${c.dial}、首都は${c.cap_ja}です。人口約${c.pop.toLocaleString('ja')}人${plugs ? `、コンセントは${plugs}タイプ` : ''}。時間帯・電圧・国旗も1ページで。`,
    faq: (c: Country, e?: { plugs: string[]; volt: string; freq: string }) => [
      [`${c.ja}の国番号は？`, `${c.ja}の国際電話の国番号は${c.dial}です。`],
      [`${c.ja}の首都は？`, `${c.ja}の首都は${c.cap_ja}です。`],
      ...(e ? [[`${c.ja}のコンセントタイプは？`, `${c.ja}のコンセントは${e.plugs.join('、')}タイプで、電圧は${e.volt} ${e.freq}です。`]] : []),
    ] as [string, string][],
  },
}
const strFor = (lang: string) => (lang === 'ko' ? S.ko : lang === 'ja' ? S.ja : S.en)

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: countrySlug(c) }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function messages(lang: string): Promise<{ toolui: Record<string, any>; toolNames: Record<string, string> }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = (await import(`../../../../../../locales/${lang}/common.json`)).default as any
    return { toolui: j.toolui || {}, toolNames: j.toolNames || {} }
  } catch { return { toolui: {}, toolNames: {} } }
}

export async function generateMetadata({ params }: { params: { lang: string; country: string } }): Promise<Metadata> {
  const c = COUNTRY_BY_SLUG[params.country.toLowerCase()]
  if (!c) return {}
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const e = EXTRA[c.code]
  const st = strFor(lang)
  const title = `${st.title(c)} | ToolBoxy`
  const description = st.desc(c, e ? e.plugs.join(', ') : '').slice(0, 155)
  const url = `${BASE}/${lang}/tools/country-info/${countrySlug(c)}`
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/country-info/${countrySlug(c)}`
  languages['x-default'] = `${BASE}/en/tools/country-info/${countrySlug(c)}`
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, type: 'article' },
  }
}

export default async function CountryPage({ params }: { params: { lang: string; country: string } }) {
  const c = COUNTRY_BY_SLUG[params.country.toLowerCase()]
  if (!c) notFound()
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const { toolui: t, toolNames } = await messages(lang)
  const L = (k: string, fb: string) => (typeof t[k] === 'string' ? t[k] : fb)
  const e = EXTRA[c.code]
  const st = strFor(lang)
  const sameRegion = COUNTRIES.filter((x) => x.region === c.region && x.code !== c.code)

  const faq = st.faq(c, e)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-2.5 flex gap-3 items-baseline"><span className="text-sm text-gray-400 w-28 shrink-0">{label}</span><span className="text-gray-800 min-w-0">{children}</span></div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${lang}/tools/country-info`} className="hover:text-brand-600">← {toolNames['country-info'] || '국가 정보'}</Link>
      </nav>

      {/* hero: big flag + names */}
      <div className="flex items-center gap-5 py-5 px-5 rounded-2xl border-2 border-gray-100">
        <div className="text-7xl leading-none shrink-0" aria-hidden>{flag(c.code)}</div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{cName(c, lang)}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{[c.ko, c.en, c.ja].filter((x) => x !== cName(c, lang)).join(' · ')}</p>
          <p className="text-xs mt-1.5"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{regionName(c.region, lang)}</span> <span className="ml-1 text-gray-400 font-mono">{c.code}</span></p>
        </div>
      </div>

      {/* fact table — the answers people actually search for */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label={L('cmp_dial', '국가번호')}><b className="text-lg">{c.dial}</b></Row>
        <Row label={L('cmp_capital', '수도')}><b>{capName(c, lang)}</b></Row>
        <Row label={L('cmp_pop', '인구')}>{c.pop.toLocaleString(lang)} <span className="text-xs text-gray-400">({L('cmp_note', '인구는 근삿값입니다.')})</span></Row>
        {e && <Row label={L('cin_tz', '시간대')}><span className="font-mono text-sm">{e.tz}</span></Row>}
        {e && (
          <Row label={L('cmp_plug', '콘센트·플러그')}>
            <span className="flex flex-wrap gap-1.5">
              {e.plugs.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-sm font-bold" title={plugName(p, lang)}>{p}</span>
              ))}
            </span>
          </Row>
        )}
        {e && <Row label={L('cmp_volt', '전압·주파수')}>{e.volt} · {e.freq}</Row>}
        <Row label={L('cin_flag', '국기')}><span className="text-3xl">{flag(c.code)}</span> <span className="text-xs text-gray-400 font-mono ml-1">{c.code}</span></Row>
      </div>

      {/* same region */}
      {sameRegion.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{regionName(c.region, lang)}</h2>
          <div className="flex flex-wrap gap-2">
            {sameRegion.map((x) => (
              <Link key={x.code} href={`/${lang}/tools/country-info/${countrySlug(x)}`}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600">
                {flag(x.code)} {cName(x, lang)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* related tools (buttons, per site convention) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {([['country-calling-codes', '📞'], ['time-difference', '🕒'], ['plug-type', '🔌'], ['country-compare', '⚖️']] as const).map(([slug, icon]) => (
          <a key={slug} href={`/${lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{toolNames[slug] || slug}</span></a>
        ))}
      </div>
    </div>
  )
}
