'use client'
// 택시 요금 계산 공용 엔진 UI — /taxi-fare(A형)와 /taxi-route(B형)가 공유.
// B형은 MapComp(Leaflet, dynamic import)를 주입받아 결과 아래에 경로 지도를 그린다.
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  tariffsForCountry, tariffById, calcTaxiFare, formatFare, asTaxiLang, correctDuration,
  type TaxiCountry, type TaxiLang,
} from '@/lib/tools/taxiFare'
import { trackToolUsed } from '@/lib/gtag'

interface HistoryItem { city: string; o: string; d: string }
const HISTORY_KEY = 'txf_history_v1'
const HISTORY_MAX = 8

export interface TaxiRouteData {
  origin: { lat: number; lng: number; label: string }
  destination: { lat: number; lng: number; label: string }
  distanceM: number
  durationSec: number
  geometry?: [number, number][] // [lat, lng] — 서버에서 Leaflet 순서로 변환됨
}

export default function TaxiFareTool({ lang: langRaw, slug, MapComp }: {
  lang: string
  slug: 'taxi-fare' | 'taxi-route'
  MapComp?: React.ComponentType<{ data: TaxiRouteData }>
}) {
  const t = useTranslations('toolui')
  const lang: TaxiLang = asTaxiLang(langRaw)

  const [country, setCountry] = useState<TaxiCountry>(lang === 'ja' ? 'JP' : 'KR')
  const [cityId, setCityId] = useState(lang === 'ja' ? 'JP-tokyo' : 'KR-seoul')
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<TaxiRouteData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const tariff = tariffById(cityId)!

  useEffect(() => { // 최근 검색 로드 (양 페이지 공유)
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setHistory((JSON.parse(raw) as HistoryItem[]).filter((h) => h && h.o && h.d && tariffById(h.city)))
    } catch { /* 손상된 기록 무시 */ }
  }, [])

  // 저장은 변경 시점(성공한 계산·삭제)에 직접 — useEffect 저장 금지 규칙
  function saveHistory(list: HistoryItem[]) {
    setHistory(list)
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)) } catch { /* quota 무시 */ }
  }
  function removeHistory(i: number) {
    saveHistory(history.filter((_, k) => k !== i))
  }
  function pickHistory(h: HistoryItem) {
    const tf = tariffById(h.city)!
    setCountry(tf.country); setCityId(h.city); setOrigin(h.o); setDest(h.d)
    calc(h.o, h.d, h.city)
  }

  function pickCountry(c: TaxiCountry) {
    setCountry(c)
    setCityId(tariffsForCountry(c)[0].id)
  }

  async function calc(oArg?: string, dArg?: string, cityArg?: string) {
    const o = (oArg ?? origin).trim()
    const d = (dArg ?? dest).trim()
    const city = cityArg ?? cityId
    const ctry = tariffById(city)!.country
    if (!o || !d || busy) return
    setBusy(true); setErr(null); setData(null)
    try {
      const r = await fetch('/api/taxi-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: o, destination: d, country: ctry, withGeometry: slug === 'taxi-route' }),
      })
      const j = await r.json()
      if (!r.ok) {
        setErr(
          j.error === 'NOT_CONFIGURED' ? t('txf_not_ready')
          : j.error === 'ORIGIN_NOT_FOUND' ? t('txf_err_origin')
          : j.error === 'DEST_NOT_FOUND' ? t('txf_err_dest')
          : j.error === 'ROUTE_NOT_FOUND' ? t('txf_err_route')
          : t('txf_err_server'),
        )
        return
      }
      // 도심 교통 보정 — 표시 시간·저속 시간요금 계산 모두 보정값 사용
      setData({ ...j, durationSec: correctDuration(j.durationSec) })
      trackToolUsed(slug)
      // 성공한 검색만 기록 (중복 제거 후 맨 앞에)
      saveHistory([
        { city, o, d },
        ...history.filter((h) => !(h.city === city && h.o === o && h.d === d)),
      ].slice(0, HISTORY_MAX))
    } catch {
      setErr(t('txf_err_server'))
    } finally {
      setBusy(false)
    }
  }

  const chip = (on: boolean) =>
    'px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-colors ' +
    (on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300')

  const fare = data ? calcTaxiFare(data.distanceM, data.durationSec, tariff) : null
  const km = data ? (data.distanceM / 1000).toFixed(1) : ''
  const min = data ? Math.max(1, Math.round(data.durationSec / 60)) : 0

  return (
    <div className="max-w-xl mx-auto">
      {/* 입력 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {(['KR', 'JP'] as TaxiCountry[]).map((c) => (
            <button key={c} onClick={() => pickCountry(c)} className={chip(country === c)}>
              {c === 'KR' ? t('txf_kr') : t('txf_jp')}
            </button>
          ))}
          <span className="w-px self-stretch bg-gray-200 mx-1" />
          {tariffsForCountry(country).map((tf) => (
            <button key={tf.id} onClick={() => setCityId(tf.id)} className={chip(cityId === tf.id)}>
              {tf.label[lang]}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && calc()}
            placeholder={t('txf_origin_ph')}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
          <input value={dest} onChange={(e) => setDest(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && calc()}
            placeholder={t('txf_dest_ph')}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">{t('txf_hint')}</p>
        <button onClick={() => calc()} disabled={busy || !origin.trim() || !dest.trim()}
          className="mt-3 w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50">
          {busy ? t('txf_calcing') : t('txf_calc')}
        </button>
        {err && <p className="mt-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-600 px-3 py-2.5">{err}</p>}

        {/* 최근 검색 — 칩 클릭으로 재계산, ×로 삭제 */}
        {history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1.5">{t('txf_recent')}</p>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span key={h.city + h.o + h.d}
                  className="inline-flex items-center gap-1 max-w-full rounded-full border border-gray-200 bg-gray-50 pl-2.5 pr-1 py-1 text-xs text-gray-600">
                  <button onClick={() => pickHistory(h)} disabled={busy}
                    className="truncate max-w-[13rem] hover:text-brand-600 disabled:opacity-50">
                    {tariffById(h.city)?.label[lang]} · {h.o} → {h.d}
                  </button>
                  <button onClick={() => removeHistory(i)} aria-label={t('txf_recent_del')}
                    className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-400 leading-none">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 결과 */}
      {data && fare && (
        <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-3 truncate">{data.origin.label} → {data.destination.label}</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-400">{t('txf_distance')}</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{km} km</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-400">{t('txf_duration')}</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{t('txf_min', { n: min })}</p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 text-center">
            <p className="text-xs text-gray-500">{t('txf_fare_day')}</p>
            <p className="text-3xl font-black text-brand-700 tabular-nums">{formatFare(fare.day, fare.currency, lang)}</p>
            <p className="mt-2 text-xs text-gray-500">
              {t('txf_fare_night')} ({tariff.nightHours}) ·{' '}
              <span className="font-bold text-gray-700 tabular-nums">
                {fare.nightMin === fare.nightMax
                  ? formatFare(fare.nightMin, fare.currency, lang)
                  : `${formatFare(fare.nightMin, fare.currency, lang)} ~ ${formatFare(fare.nightMax, fare.currency, lang)}`}
              </span>
            </p>
          </div>
          {MapComp && data.geometry && <div className="mt-3"><MapComp data={data} /></div>}
          <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">{t('txf_note')}</p>
          <p className="text-[11px] text-gray-300">{t('txf_src', { city: tariff.label[lang], date: tariff.updated })}</p>
        </div>
      )}
    </div>
  )
}
