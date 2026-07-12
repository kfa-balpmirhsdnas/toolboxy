'use client'
// 택시 요금 계산 공용 엔진 UI — /taxi-fare(A형)와 /taxi-route(B형)가 공유.
// B형은 MapComp(Leaflet, dynamic import)를 주입받아 결과 아래에 경로 지도를 그린다.
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  tariffsForCountry, tariffById, calcTaxiFare, formatFare, asTaxiLang,
  type TaxiCountry, type TaxiLang,
} from '@/lib/tools/taxiFare'
import { trackToolUsed } from '@/lib/gtag'

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

  const tariff = tariffById(cityId)!

  function pickCountry(c: TaxiCountry) {
    setCountry(c)
    setCityId(tariffsForCountry(c)[0].id)
  }

  async function calc() {
    if (!origin.trim() || !dest.trim() || busy) return
    setBusy(true); setErr(null); setData(null)
    try {
      const r = await fetch('/api/taxi-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination: dest, country, withGeometry: slug === 'taxi-route' }),
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
      setData(j)
      trackToolUsed(slug)
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
        <button onClick={calc} disabled={busy || !origin.trim() || !dest.trim()}
          className="mt-3 w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50">
          {busy ? t('txf_calcing') : t('txf_calc')}
        </button>
        {err && <p className="mt-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-600 px-3 py-2.5">{err}</p>}
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
