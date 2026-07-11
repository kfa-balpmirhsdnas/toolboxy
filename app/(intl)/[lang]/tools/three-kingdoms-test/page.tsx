'use client'
import { useEffect, useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import {
  AXES, QUESTIONS, CHARS, CHAR_BY_SLUG, CHAR_BY_CODE, resolveCode,
  type AB, type TKChar, type TKLang,
} from '@/lib/tools/threeKingdoms'

const tool = getToolBySlug('three-kingdoms-test')!

const asLang = (l: string): TKLang => (l === 'ko' || l === 'ja' ? l : 'en')

export default function ThreeKingdomsTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = asLang(params.lang)
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}

  const [stage, setStage] = useState<'start' | 'quiz' | 'result'>('start')
  const [answers, setAnswers] = useState<AB[]>([])
  const [result, setResult] = useState<TKChar | null>(null)
  // A-count per axis (0–3); null when the result came from a shared URL / type list.
  const [axisCounts, setAxisCounts] = useState<number[] | null>(null)
  const [copied, setCopied] = useState(false)

  // Shared-result deep link: /three-kingdoms-test?r=<slug> shows that result directly.
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('r')
    if (r && CHAR_BY_SLUG[r]) { setResult(CHAR_BY_SLUG[r]); setAxisCounts(null); setStage('result') }
  }, [])

  function start() { setAnswers([]); setAxisCounts(null); setStage('quiz') }

  function answer(ab: AB) {
    const next = [...answers, ab]
    if (next.length < QUESTIONS.length) { setAnswers(next); return }
    const code = resolveCode(next)
    const cnt = [0, 0, 0, 0]
    next.forEach((a, i) => { if (a === 'A') cnt[QUESTIONS[i].axis]++ })
    setAnswers(next)
    setAxisCounts(cnt)
    setResult(CHAR_BY_CODE[code])
    setStage('result')
  }

  function showChar(c: TKChar) {
    setResult(c)
    setAxisCounts(null)
    setStage('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shareUrl = (c: TKChar) => `${window.location.origin}/${lang}/tools/three-kingdoms-test?r=${c.slug}`

  async function share(c: TKChar) {
    const url = shareUrl(c)
    const text = `${c.catch[lang]} — ${c.name[lang]}`
    if (navigator.share) {
      try { await navigator.share({ title: t('tk_title'), text, url }); return } catch { /* canceled */ }
    }
    copyUrl(c)
  }
  function copyUrl(c: TKChar) {
    navigator.clipboard?.writeText(shareUrl(c)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  // 1080×1080 share card: color band + hanja symbol + name + catchphrase +
  // 4 axis bars + site watermark. Text/color/symbol only (no portraits).
  function saveCard(c: TKChar) {
    const S = 1080
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const x = cv.getContext('2d')!
    x.fillStyle = '#111827'; x.fillRect(0, 0, S, S)
    x.fillStyle = c.color; x.fillRect(0, 0, S, 14)
    x.textAlign = 'center'
    // symbol in a colored ring
    x.beginPath(); x.arc(S / 2, 270, 150, 0, Math.PI * 2); x.strokeStyle = c.color; x.lineWidth = 10; x.stroke()
    x.fillStyle = c.color; x.font = 'bold 170px serif'; x.fillText(c.symbol, S / 2, 330)
    // title / name / catch
    x.fillStyle = '#9ca3af'; x.font = '36px sans-serif'; x.fillText(t('tk_title'), S / 2, 505)
    x.fillStyle = '#ffffff'; x.font = 'bold 96px sans-serif'; x.fillText(c.name[lang], S / 2, 615)
    x.fillStyle = '#d1d5db'; x.font = '40px serif'; x.fillText(c.hanja, S / 2, 675)
    x.fillStyle = c.color; x.font = 'bold 44px sans-serif'; x.fillText(c.catch[lang], S / 2, 750)
    // axis bars
    const bw = 640, bx = (S - bw) / 2
    AXES.forEach((ax, i) => {
      const y = 820 + i * 52
      const aSide = c.code[i] === 'A'
      const frac = axisCounts ? axisCounts[i] / 3 : (aSide ? 1 : 0)
      x.textAlign = 'right'; x.fillStyle = aSide ? '#ffffff' : '#6b7280'; x.font = 'bold 28px sans-serif'
      x.fillText(ax.a[lang], bx - 18, y + 9)
      x.textAlign = 'left'; x.fillStyle = aSide ? '#6b7280' : '#ffffff'
      x.fillText(ax.b[lang], bx + bw + 18, y + 9)
      x.fillStyle = '#374151'
      x.beginPath(); x.roundRect(bx, y - 8, bw, 16, 8); x.fill()
      x.fillStyle = c.color
      x.beginPath(); x.arc(bx + bw * (1 - frac), y, 16, 0, Math.PI * 2); x.fill()
    })
    x.textAlign = 'center'; x.fillStyle = '#6b7280'; x.font = '30px sans-serif'
    x.fillText('toolboxy.net', S / 2, 1042)
    const a = document.createElement('a')
    a.download = `three-kingdoms-${c.slug}.png`
    a.href = cv.toDataURL('image/png')
    a.click()
  }

  const primaryBtn = 'px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors'
  const outlineBtn = 'px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors'

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-xl mx-auto px-4">

        {stage === 'start' && (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">⚔️</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tk_title')}</h1>
            <p className="text-gray-500 mb-2">{t('tk_subtitle')}</p>
            <p className="text-xs text-gray-400 mb-8">{t('tk_meta_line')}</p>
            <button onClick={start} className={primaryBtn + ' text-lg px-10'}>{t('tk_start')}</button>
          </div>
        )}

        {stage === 'quiz' && (() => {
          const i = answers.length
          const q = QUESTIONS[i]
          return (
            <div className="py-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(i / QUESTIONS.length) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-500 tabular-nums shrink-0">{i + 1} / {QUESTIONS.length}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                <p className="text-lg font-bold text-gray-900 text-center">{q.text[lang]}</p>
              </div>
              <div className="grid gap-3">
                {(['A', 'B'] as AB[]).map(ab => (
                  <button key={ab} onClick={() => answer(ab)}
                    className="px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 font-medium text-left hover:border-brand-400 hover:bg-brand-50 transition-colors">
                    {(ab === 'A' ? q.a : q.b)[lang]}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {stage === 'result' && result && (
          <div className="py-4">
            <div className="bg-white rounded-2xl border-2 p-6 text-center" style={{ borderColor: result.color }}>
              <div className="w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center mb-3" style={{ borderColor: result.color }}>
                <span className="text-5xl font-bold font-serif" style={{ color: result.color }}>{result.symbol}</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: result.color }}>{result.catch[lang]}</p>
              <h2 className="text-4xl font-black text-gray-900 mt-1">{result.name[lang]}</h2>
              <p className="text-sm text-gray-400 font-serif">{result.hanja}</p>
              <p className="text-sm text-gray-600 mt-4 text-left leading-relaxed">{result.desc[lang]}</p>

              <div className="mt-5 text-left">
                <p className="text-xs font-bold text-gray-500 mb-1.5">{t('tk_strengths')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strengths[lang].map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium text-white" style={{ background: result.color }}>{s}</span>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-500 mt-3 mb-1">{t('tk_caution')}</p>
                <p className="text-xs text-gray-500">{result.caution[lang]}</p>
              </div>

              {/* 4-axis sliders */}
              <div className="mt-6 space-y-3">
                {AXES.map((ax, i) => {
                  const aSide = result.code[i] === 'A'
                  const frac = axisCounts ? axisCounts[i] / 3 : (aSide ? 1 : 0) // 1 = fully A
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={'w-14 text-right shrink-0 ' + (aSide ? 'font-bold text-gray-800' : 'text-gray-400')}>{ax.a[lang]}</span>
                      <div className="relative flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow"
                          style={{ background: result.color, left: `calc(${(1 - frac) * 100}% - 8px)` }} />
                      </div>
                      <span className={'w-14 text-left shrink-0 ' + (!aSide ? 'font-bold text-gray-800' : 'text-gray-400')}>{ax.b[lang]}</span>
                    </div>
                  )
                })}
              </div>

              {/* match / clash */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {([['tk_match', result.match], ['tk_clash', result.clash]] as const).map(([key, slug]) => {
                  const c = CHAR_BY_SLUG[slug]
                  return (
                    <button key={key} onClick={() => showChar(c)} className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                      <p className="text-[11px] text-gray-400 mb-1">{t(key)}</p>
                      <p className="font-bold" style={{ color: c.color }}>{c.symbol} {c.name[lang]}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* share row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => saveCard(result)} className={outlineBtn}>🖼 {t('tk_save_img')}</button>
              <button onClick={() => share(result)} className={outlineBtn}>📤 {t('tk_share')}</button>
              <button onClick={() => copyUrl(result)} className={outlineBtn}>{copied ? '✓ ' + t('tk_copied') : '🔗 ' + t('tk_copy')}</button>
            </div>

            <div className="mt-4 text-center">
              <button onClick={start} className={primaryBtn + ' w-full text-lg'}>
                {axisCounts ? t('tk_retry') : t('tk_take')}
              </button>
            </div>
          </div>
        )}

        {/* SEO: what is this test + all 16 types (also the "browse all types" section) */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t('tk_seo_title')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{t('tk_seo_body')}</p>
          <h3 className="text-base font-bold text-gray-900 mb-3">{t('tk_types_title')}</h3>
          <div className="grid gap-3 min-[520px]:grid-cols-2">
            {CHARS.map(c => (
              <button key={c.slug} onClick={() => showChar(c)}
                className="text-left rounded-xl border border-gray-200 p-3 hover:border-brand-300 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-bold" style={{ color: c.color }}>{c.symbol} {c.name[lang]} <span className="text-gray-400 font-serif font-normal text-xs">{c.hanja}</span></p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">{c.catch[lang]}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc[lang]}</p>
              </button>
            ))}
          </div>
          <Link href={`/${lang}/tools/three-kingdoms-idioms`}
            className="mt-6 block rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            📜 {toolNames['three-kingdoms-idioms'] || 'Three Kingdoms Idioms'}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
