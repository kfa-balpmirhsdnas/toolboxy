'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { EXTRA, plugName } from '@/lib/country-extra'

const tool = getToolBySlug('world-clock')!

type City = { tz: string; en: string; ko: string; ja: string; flag: string; cc: string }
const CITIES: City[] = [
  { tz: 'Asia/Seoul', en: 'Seoul', ko: '서울', ja: 'ソウル', flag: '🇰🇷', cc: 'KR' },
  { tz: 'Asia/Tokyo', en: 'Tokyo', ko: '도쿄', ja: '東京', flag: '🇯🇵', cc: 'JP' },
  { tz: 'Asia/Shanghai', en: 'Beijing', ko: '베이징', ja: '北京', flag: '🇨🇳', cc: 'CN' },
  { tz: 'Asia/Bangkok', en: 'Bangkok', ko: '방콕', ja: 'バンコク', flag: '🇹🇭', cc: 'TH' },
  { tz: 'Asia/Kolkata', en: 'Mumbai', ko: '뭄바이', ja: 'ムンバイ', flag: '🇮🇳', cc: 'IN' },
  { tz: 'Asia/Dubai', en: 'Dubai', ko: '두바이', ja: 'ドバイ', flag: '🇦🇪', cc: 'AE' },
  { tz: 'Europe/Moscow', en: 'Moscow', ko: '모스크바', ja: 'モスクワ', flag: '🇷🇺', cc: 'RU' },
  { tz: 'Europe/Paris', en: 'Paris', ko: '파리', ja: 'パリ', flag: '🇫🇷', cc: 'FR' },
  { tz: 'Europe/London', en: 'London', ko: '런던', ja: 'ロンドン', flag: '🇬🇧', cc: 'GB' },
  { tz: 'America/New_York', en: 'New York', ko: '뉴욕', ja: 'ニューヨーク', flag: '🇺🇸', cc: 'US' },
  { tz: 'America/Chicago', en: 'Chicago', ko: '시카고', ja: 'シカゴ', flag: '🇺🇸', cc: 'US' },
  { tz: 'America/Los_Angeles', en: 'Los Angeles', ko: '로스앤젤레스', ja: 'ロサンゼルス', flag: '🇺🇸', cc: 'US' },
  { tz: 'America/Sao_Paulo', en: 'São Paulo', ko: '상파울루', ja: 'サンパウロ', flag: '🇧🇷', cc: 'BR' },
  { tz: 'Australia/Sydney', en: 'Sydney', ko: '시드니', ja: 'シドニー', flag: '🇦🇺', cc: 'AU' },
  { tz: 'Pacific/Auckland', en: 'Auckland', ko: '오클랜드', ja: 'オークランド', flag: '🇳🇿', cc: 'NZ' },
  { tz: 'Pacific/Honolulu', en: 'Honolulu', ko: '호놀룰루', ja: 'ホノルル', flag: '🇺🇸', cc: 'US' },
]
const cityName = (c: City, lang: string) => (lang === 'ko' ? c.ko : lang === 'ja' ? c.ja : c.en)

export default function WorldClockPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function parts(c: City) {
    if (!now) return { time: '', date: '', day: false }
    const time = new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US',
      { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: lang === 'en', timeZone: c.tz }).format(now)
    const date = new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US',
      { month: 'short', day: 'numeric', weekday: 'short', timeZone: c.tz }).format(now)
    const here = +new Intl.DateTimeFormat('en', { day: 'numeric', timeZone: 'Asia/Seoul' }).format(now)
    const there = +new Intl.DateTimeFormat('en', { day: 'numeric', timeZone: c.tz }).format(now)
    return { time, date, day: here !== there }
  }

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid sm:grid-cols-2 gap-2">
          {CITIES.map((c) => {
            const p = parts(c)
            const ex = EXTRA[c.cc]
            return (
              <div key={c.tz} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{c.flag}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">{cityName(c, lang)}</div>
                    <div className="text-xs text-gray-400">{p.date}</div>
                    {ex && (
                      <div className="text-[11px] text-gray-400 mt-0.5" title={ex.plugs.map((pl) => plugName(pl, lang)).join(', ')}>
                        🔌 {ex.plugs.join('·')} · {ex.volt}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 tabular-nums shrink-0">{p.time || '—'}</div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400">{t('wc_note')}</p>
      </div>
    </ToolLayout>
  )
}
