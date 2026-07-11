'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { TRAITS, generateName, type GeneratedName, type TKTrait } from '@/lib/tools/threeKingdomsNames'
import { TKC_BY_ID } from '@/lib/tools/threeKingdomsCharacters'
import { asTKLang, type TKLang } from '@/lib/tools/tkCommon'

const tool = getToolBySlug('three-kingdoms-name-generator')!

export default function ThreeKingdomsNameGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang: TKLang = asTKLang(params.lang)

  const [input, setInput] = useState('')
  const [traits, setTraits] = useState<TKTrait[]>([])
  const [tendency, setTendency] = useState<'civil' | 'military'>('civil')
  const [result, setResult] = useState<GeneratedName | null>(null)
  const [err, setErr] = useState('')

  function toggleTrait(id: TKTrait) {
    setTraits((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id])
  }

  function run() {
    if (!input.trim()) { setErr(t('tkn_err_name')); return }
    if (traits.length < 2) { setErr(t('tkn_err_traits')); return }
    setErr('')
    setResult(generateName(input, traits, tendency))
  }

  const fullHanja = result ? result.surname.hanja + result.given.hanja : ''
  const courtesyHanja = result ? result.prefix.hanja + result.pair.hanja : ''
  const reading = (g: { ko: string; ja: string; pinyin: string }) => lang === 'ko' ? g.ko : lang === 'ja' ? g.ja : g.pinyin
  const match = result ? TKC_BY_ID[result.matchChar] : null

  function saveCard() {
    if (!result) return
    const S = 1080
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const x = cv.getContext('2d')!
    x.fillStyle = '#111827'; x.fillRect(0, 0, S, S)
    x.fillStyle = '#f59e0b'; x.fillRect(0, 0, S, 14)
    x.textAlign = 'center'
    x.fillStyle = '#9ca3af'; x.font = '36px sans-serif'; x.fillText(t('tkn_title'), S / 2, 160)
    x.fillStyle = '#ffffff'; x.font = 'bold 220px serif'; x.fillText(fullHanja, S / 2, 480)
    x.fillStyle = '#d1d5db'; x.font = '48px sans-serif'
    x.fillText(`${reading(result.surname)}${lang === 'en' ? ' ' : ''}${reading(result.given)}`, S / 2, 570)
    x.fillStyle = '#f59e0b'; x.font = 'bold 72px serif'
    x.fillText(`${t('tkn_courtesy')} ${courtesyHanja}`, S / 2, 720)
    x.fillStyle = '#9ca3af'; x.font = '34px sans-serif'
    x.fillText(`${result.given.hanja}: ${result.given.mean[lang]}`, S / 2, 820)
    if (match) x.fillText(`${t('tkn_match')}: ${match.name[lang]} ${match.hanja}`, S / 2, 880)
    x.fillStyle = '#6b7280'; x.font = '30px sans-serif'; x.fillText('toolboxy.net', S / 2, 1042)
    const a = document.createElement('a')
    a.download = `three-kingdoms-name-${fullHanja}.png`
    a.href = cv.toDataURL('image/png')
    a.click()
  }

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkn_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tkn_subtitle')}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('tkn_input')}</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()}
              placeholder={t('tkn_input_ph')}
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <div>
            <span className="text-sm font-medium text-gray-700">{t('tkn_traits')} <span className="text-xs text-gray-400">({traits.length}/3)</span></span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TRAITS.map((tr) => (
                <button key={tr.id} onClick={() => toggleTrait(tr.id)} className={chipCls(traits.includes(tr.id))}>{tr.label[lang]}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('tkn_tendency')}</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
              <button onClick={() => setTendency('civil')} className={'px-4 py-1.5 font-medium ' + (tendency === 'civil' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600')}>{t('tkn_civil')}</button>
              <button onClick={() => setTendency('military')} className={'px-4 py-1.5 font-medium ' + (tendency === 'military' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600')}>{t('tkn_military')}</button>
            </div>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button onClick={run} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold">{t('tkn_run')}</button>
          <p className="text-[11px] text-gray-400">{t('tkn_note')}</p>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-amber-200 p-6 text-center">
            <p className="text-6xl font-black text-gray-900 font-serif">{fullHanja}</p>
            <p className="mt-2 text-lg font-bold text-gray-700">
              {reading(result.surname)}{lang === 'en' ? ' ' : ''}{reading(result.given)}
            </p>
            <p className="mt-1 text-sm font-bold text-amber-600 font-serif">
              {t('tkn_courtesy')}: {courtesyHanja} <span className="font-sans font-medium text-amber-500">({reading(result.prefix)}{reading(result.pair)})</span>
            </p>

            {/* per-glyph meanings */}
            <div className="mt-5 text-left space-y-1.5 rounded-xl bg-gray-50 border border-gray-100 p-3">
              {[result.surname, result.given, result.prefix, result.pair].map((g, i) => (
                <p key={i} className="text-xs text-gray-600">
                  <span className="font-serif font-bold text-gray-900 mr-1.5">{g.hanja}</span>
                  <span className="text-gray-400 mr-1.5">{g.ko} · {g.ja} · {g.pinyin}</span>
                  {g.mean[lang]}
                </p>
              ))}
            </div>

            {match && (
              <Link href={`/${lang}/tools/three-kingdoms-characters/${match.id}`}
                className="mt-4 block rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                <p className="text-[11px] text-gray-400 mb-0.5">{t('tkn_match')}</p>
                <p className="font-bold text-gray-900">{match.name[lang]} <span className="text-gray-400 font-serif font-normal">{match.hanja}</span></p>
              </Link>
            )}

            <button onClick={saveCard}
              className="mt-4 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium">🖼 {t('tkn_save')}</button>
          </div>
        )}

        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/three-kingdoms-test`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            ⚔️ {t('tk_title')}
          </Link>
          <Link href={`/${lang}/tools/three-kingdoms-characters`}
            className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            👤 {t('tkc_title')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
