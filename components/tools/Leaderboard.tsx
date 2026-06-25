'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

interface Entry {
  name: string
  score: number
  country?: string
}

const LOCALES = ['en', 'ja', 'ko']

// ISO-3166 alpha-2 -> regional-indicator flag emoji (🇰🇷). Empty when unknown.
const flagOf = (cc?: string) =>
  cc && /^[A-Z]{2}$/.test(cc) ? cc.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) : ''

/**
 * Opt-in leaderboard for score-based games. Shows the top scores and, when a
 * fresh `score` is available, lets the player add their name (their choice).
 * Backed by /api/leaderboard (Firestore).
 */
export default function Leaderboard({
  game,
  score,
  unit = '',
  better = 'lower', // 'lower' = lower score ranks higher (reaction time)
}: {
  game: string
  score?: number | null
  unit?: string
  better?: 'lower' | 'higher'
}) {
  const [top, setTop] = useState<Entry[]>([])
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [myRank, setMyRank] = useState<{ rank: number; total: number } | null>(null)
  const [submittedScore, setSubmittedScore] = useState<number | null>(null)
  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const t = useTranslations('leaderboard')

  const pathname = usePathname()
  const lang = LOCALES.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en'

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaderboard?game=${game}&limit=10`)
      if (res.ok) setTop((await res.json()).top ?? [])
    } catch { /* ignore */ }
  }, [game])

  useEffect(() => { load() }, [load])

  async function submit() {
    if (score == null || !user || user === 'loading') return
    setSubmitting(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ game, name, score }),
      })
      const data = await res.json()
      if (res.ok) {
        setMyRank({ rank: data.rank, total: data.total })
        setSubmittedScore(score)
        await load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const hasScore = score != null && submittedScore !== score
  const loggedIn = !!user && user !== 'loading'

  return (
    <section className="max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">🏆 {t('title')}</h2>

      {hasScore && loggedIn && (
        <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-sm text-brand-800 mb-2">{t('add_score', { score: `${score}${unit}` })}</p>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('display_name')} maxLength={20}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={submit} disabled={submitting}
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {submitting ? '…' : t('submit')}
            </button>
          </div>
        </div>
      )}

      {hasScore && user === null && (
        <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-4 text-center">
          <p className="text-sm text-brand-800 mb-2">{t('login_prompt', { score: `${score}${unit}` })}</p>
          <Link href={`/${lang}/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-block rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            {t('login_btn')}
          </Link>
          <p className="mt-2 text-xs text-gray-400">{t('login_note')}</p>
        </div>
      )}

      {myRank && (
        <p className="mb-3 text-center text-sm font-medium text-brand-700">
          {t('ranked', { rank: myRank.rank, total: myRank.total })}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
        {top.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">{t('empty')}</p>
        ) : (
          top.map((e, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i === 0 ? 'bg-amber-50' : ''}`}>
              <span className={`w-6 font-bold ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>{i + 1}</span>
              <span className="flex-1 truncate text-gray-800">
                {e.country && <span className="mr-1.5" title={e.country}>{flagOf(e.country)}</span>}
                {e.name}
              </span>
              <span className="font-semibold text-gray-900">{e.score}{unit}</span>
            </div>
          ))
        )}
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        {better === 'lower' ? t('lower_better') : t('higher_better')} {t('casual')}
      </p>
    </section>
  )
}
