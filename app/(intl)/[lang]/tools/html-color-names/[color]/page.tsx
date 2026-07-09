import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CSS_COLORS, COLOR_BY_SLUG, colorSlug, hexToRgb, rgbToHsl, similarColors, nearestTailwind, type CssColor } from '@/lib/color-names'

// Longtail SEO pages: one static page per CSS named color ("coral 색상코드", "teal hex"…).
// Preview, HEX/RGB/HSL, CSS usage, nearest Tailwind classes and similar named colors.

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

const S = {
  ko: {
    title: (c: CssColor, rgb: string) => `${c.name} 색상 코드 — HEX ${c.hex} · RGB(${rgb})`,
    desc: (c: CssColor, rgb: string, hsl: string) => `CSS 색상 ${c.name}의 HEX 코드는 ${c.hex}, RGB는 ${rgb}, HSL은 ${hsl}입니다. 미리보기·비슷한 색·Tailwind 클래스까지 한 페이지에서 확인하세요.`,
    faq: (c: CssColor, rgb: string, sims: string) => [
      [`${c.name} 색상 코드는?`, `${c.name}의 HEX 색상 코드는 ${c.hex}입니다.`],
      [`${c.name}의 RGB 값은?`, `${c.name}의 RGB 값은 rgb(${rgb})입니다.`],
      [`${c.name}과 비슷한 색은?`, `${c.name}과 비슷한 CSS 색상으로 ${sims} 등이 있습니다.`],
    ] as [string, string][],
  },
  en: {
    title: (c: CssColor, rgb: string) => `${c.name} Color Code — HEX ${c.hex} · RGB(${rgb})`,
    desc: (c: CssColor, rgb: string, hsl: string) => `The CSS color ${c.name} has HEX code ${c.hex}, RGB ${rgb} and HSL ${hsl}. Preview it with similar colors and the closest Tailwind classes on one page.`,
    faq: (c: CssColor, rgb: string, sims: string) => [
      [`What is the color code for ${c.name}?`, `The HEX color code for ${c.name} is ${c.hex}.`],
      [`What is the RGB value of ${c.name}?`, `The RGB value of ${c.name} is rgb(${rgb}).`],
      [`What colors are similar to ${c.name}?`, `CSS colors similar to ${c.name} include ${sims}.`],
    ] as [string, string][],
  },
  ja: {
    title: (c: CssColor, rgb: string) => `${c.name}の色コード — HEX ${c.hex}・RGB(${rgb})`,
    desc: (c: CssColor, rgb: string, hsl: string) => `CSSカラー${c.name}のHEXコードは${c.hex}、RGBは${rgb}、HSLは${hsl}です。プレビュー・類似色・Tailwindクラスまで1ページで確認できます。`,
    faq: (c: CssColor, rgb: string, sims: string) => [
      [`${c.name}の色コードは？`, `${c.name}のHEXカラーコードは${c.hex}です。`],
      [`${c.name}のRGB値は？`, `${c.name}のRGB値はrgb(${rgb})です。`],
      [`${c.name}に似た色は？`, `${c.name}に似たCSSカラーには${sims}などがあります。`],
    ] as [string, string][],
  },
}
const strFor = (lang: string) => (lang === 'ko' ? S.ko : lang === 'ja' ? S.ja : S.en)

export function generateStaticParams() {
  return CSS_COLORS.map((c) => ({ color: colorSlug(c) }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function messages(lang: string): Promise<{ toolui: Record<string, any>; toolNames: Record<string, string> }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = (await import(`../../../../../../locales/${lang}/common.json`)).default as any
    return { toolui: j.toolui || {}, toolNames: j.toolNames || {} }
  } catch { return { toolui: {}, toolNames: {} } }
}

export async function generateMetadata({ params }: { params: { lang: string; color: string } }): Promise<Metadata> {
  const c = COLOR_BY_SLUG[params.color.toLowerCase()]
  if (!c) return {}
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const { r, g, b } = hexToRgb(c.hex)
  const { h, s, l } = rgbToHsl(r, g, b)
  const st = strFor(lang)
  const rgbStr = `${r}, ${g}, ${b}`
  const title = `${st.title(c, rgbStr)} | ToolBoxy`
  const description = st.desc(c, rgbStr, `${h}°, ${s}%, ${l}%`).slice(0, 155)
  const url = `${BASE}/${lang}/tools/html-color-names/${colorSlug(c)}`
  const languages: Record<string, string> = {}
  for (const lg of LANGS) languages[lg] = `${BASE}/${lg}/tools/html-color-names/${colorSlug(c)}`
  languages['x-default'] = `${BASE}/en/tools/html-color-names/${colorSlug(c)}`
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, type: 'article' },
  }
}

export default async function ColorPage({ params }: { params: { lang: string; color: string } }) {
  const c = COLOR_BY_SLUG[params.color.toLowerCase()]
  if (!c) notFound()
  const lang = (LANGS as readonly string[]).includes(params.lang) ? params.lang : 'en'
  const { toolui: t, toolNames } = await messages(lang)
  const L = (k: string, fb: string) => (typeof t[k] === 'string' ? t[k] : fb)
  const { r, g, b } = hexToRgb(c.hex)
  const { h, s, l } = rgbToHsl(r, g, b)
  const rgbStr = `${r}, ${g}, ${b}`
  const sims = similarColors(c.hex, 8)
  const tw = nearestTailwind(c.hex, 3)
  const st = strFor(lang)
  const idx = CSS_COLORS.findIndex((x) => x.name === c.name)
  const prev = CSS_COLORS[idx - 1]
  const next = CSS_COLORS[idx + 1]
  const lightText = l > 60 // dark text on light swatches

  const faq = st.faq(c, rgbStr, sims.slice(0, 3).map((x) => x.name).join(', '))
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="px-4 py-2.5 flex gap-3 items-baseline"><span className="text-sm text-gray-400 w-24 shrink-0">{label}</span><span className="text-gray-800 min-w-0">{children}</span></div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-400">
        <Link href={`/${lang}/tools/html-color-names`} className="hover:text-brand-600">← {toolNames['html-color-names'] || 'HTML Color Names'}</Link>
      </nav>

      {/* hero: big swatch with the values on it */}
      <div className="rounded-2xl overflow-hidden border-2 border-gray-100">
        <div className="h-44 flex flex-col items-center justify-center gap-1" style={{ background: c.hex }}>
          <h1 className={'text-3xl font-black ' + (lightText ? 'text-gray-900' : 'text-white')}>{c.name}</h1>
          <p className={'font-mono text-lg font-bold ' + (lightText ? 'text-gray-800' : 'text-white/90')}>{c.hex}</p>
        </div>
        {/* text-on-colour samples (light + dark contexts) */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 text-center text-sm">
          <div className="py-3 bg-white" style={{ color: c.hex }}>Aa Bb 123 가나다</div>
          <div className="py-3 bg-gray-900" style={{ color: c.hex }}>Aa Bb 123 가나다</div>
        </div>
      </div>

      {/* value table */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        <Row label="HEX"><b className="font-mono">{c.hex}</b></Row>
        <Row label="RGB"><span className="font-mono">rgb({rgbStr})</span></Row>
        <Row label="HSL"><span className="font-mono">hsl({h}, {s}%, {l}%)</span></Row>
        <Row label={L('hcn_css', 'CSS 사용법')}>
          <code className="block text-xs bg-gray-50 rounded-lg px-3 py-2 font-mono text-gray-700">color: {c.name.toLowerCase()};<br />background-color: {c.hex};</code>
        </Row>
        <Row label="Tailwind">
          <span className="flex flex-wrap gap-1.5">
            {tw.map((x) => (
              <span key={x.name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-mono text-gray-700">
                <span className="w-3.5 h-3.5 rounded border border-black/10" style={{ background: x.hex }} />{x.name}
              </span>
            ))}
          </span>
        </Row>
      </div>

      {/* similar colors */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{L('hcn_similar', '비슷한 색')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sims.map((x) => (
            <Link key={x.name} href={`/${lang}/tools/html-color-names/${colorSlug(x)}`}
              className="rounded-xl border border-gray-100 overflow-hidden hover:border-brand-300 group">
              <div className="h-10" style={{ background: x.hex }} />
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-brand-600">{x.name}</p>
                <p className="text-[10px] font-mono text-gray-400">{x.hex}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* prev / next alphabetical */}
      <div className="flex items-center justify-between gap-2">
        {prev ? (
          <Link href={`/${lang}/tools/html-color-names/${colorSlug(prev)}`} className="flex-1 inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">← <span className="w-4 h-4 rounded border border-black/10 shrink-0" style={{ background: prev.hex }} />{prev.name}</Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/${lang}/tools/html-color-names/${colorSlug(next)}`} className="flex-1 inline-flex items-center justify-end gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600">{next.name}<span className="w-4 h-4 rounded border border-black/10 shrink-0" style={{ background: next.hex }} /> →</Link>
        ) : <span className="flex-1" />}
      </div>

      {/* related tools (buttons, per site convention) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {([['html-color-names', '🎨'], ['color-converter', '🔄'], ['color-to-tailwind', '🌬️'], ['color-shades-generator', '🌈']] as const).map(([slug, icon]) => (
          <a key={slug} href={`/${lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{toolNames[slug] || slug}</span></a>
        ))}
      </div>
    </div>
  )
}
