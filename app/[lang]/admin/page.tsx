'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

const ADMIN_EMAILS = ['sandshrimp.lab@gmail.com']

const QUICK_LINKS = [
  {
    label: 'Firebase Console — Users',
    desc: '신규 가입자 목록, 이메일',
    href: 'https://console.firebase.google.com/project/toolboxy-prod/authentication/users',
    icon: '🔥',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  },
  {
    label: 'GA4 — Pages & screens',
    desc: '어떤 툴이 많이 쓰였나',
    href: 'https://analytics.google.com/analytics/web/#/p432085798/reports/explorer',
    icon: '📊',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  },
  {
    label: 'GA4 — Engagement Overview',
    desc: '사용자가 얼마나 머물렀나',
    href: 'https://analytics.google.com/analytics/web/#/p432085798/reports/engagement-overview',
    icon: '⏱',
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
  },
  {
    label: 'GA4 — Demographics',
    desc: '국가별 / 기기별 사용자',
    href: 'https://analytics.google.com/analytics/web/#/p432085798/reports/user-demographics-overview',
    icon: '🌍',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
  },
  {
    label: 'Firestore — Users',
    desc: '사용자별 툴 사용량 기록',
    href: 'https://console.firebase.google.com/project/toolboxy-prod/firestore/data/~2Fusers',
    icon: '🗃',
    color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
  },
  {
    label: 'Vercel — Deployments',
    desc: '배포 현황 및 로그',
    href: 'https://vercel.com/kfa-balpmirhsdnas-projects/toolboxy/deployments',
    icon: '▲',
    color: 'bg-gray-50 border-gray-200 hover:border-gray-400',
  },
]

interface Stats {
  totalUsers: number
  today: string
  totalViews: number
  recentUsers: Array<{
    uid: string; email: string; displayName: string
    createdAt: string; lastSignIn: string; emailVerified: boolean
  }>
  topTools: Array<{ slug: string; count: number }>
  topViewed: Array<{ slug: string; views: number; category: string }>
  topWeek: Array<{ slug: string; views: number; category: string }>
  topToday: Array<{ slug: string; views: number; category: string }>
}

type Period = 'all' | 'week' | 'today'
const PERIOD_LABEL: Record<Period, string> = { all: '전체 누적', week: '이번 주', today: '오늘' }

export default function AdminPage({ params }: { params: { lang: string } }) {
  const [authed, setAuthed] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [stats, setStats] = useState<Stats | null>(null)
  const [period, setPeriod] = useState<Period>('all')
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthed('denied'); return }
      if (!ADMIN_EMAILS.includes(user.email ?? '')) { setAuthed('denied'); return }
      setAuthed('ok')

      setStatsLoading(true)
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: 'Bearer ' + token }
        })
        const data = await res.json()
        if (res.ok) setStats(data)
        else setStatsError(data.error)
      } catch {
        setStatsError('Failed to load stats')
      } finally {
        setStatsLoading(false)
      }
    })
  }, [])

  if (authed === 'loading') {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading…</div>
  }
  if (authed === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-500 mt-2">Admin only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛠 Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">ToolBoxy 관리자 전용 — {stats?.today ?? ''}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">총 가입자</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">오늘 툴 사용 (종류)</p>
            <p className="text-3xl font-bold text-gray-900">{stats.topTools.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">오늘 총 사용 횟수</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.topTools.reduce((s, t) => s + t.count, 0)}
            </p>
          </div>
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-brand-500 mb-1">전체 누적 클릭 (게스트 포함)</p>
            <p className="text-3xl font-bold text-brand-700">{(stats.totalViews ?? 0).toLocaleString()}</p>
          </div>
        </div>
      )}
      {statsLoading && <p className="text-sm text-gray-400">Loading stats…</p>}
      {statsError && <p className="text-sm text-red-500">{statsError}</p>}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">빠른 링크</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={'flex items-start gap-3 p-4 rounded-2xl border transition-colors ' + l.color}
            >
              <span className="text-2xl">{l.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{l.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {stats && (() => {
        const rows = period === 'all' ? stats.topViewed : period === 'week' ? (stats.topWeek ?? []) : (stats.topToday ?? [])
        return (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-800">인기 툴 Top 30 — 클릭수 (게스트 포함)</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['all', 'week', 'today'] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={'px-3 py-1 text-xs font-semibold rounded-md transition-colors ' + (period === p ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {period === 'all' ? 'toolStats 조회수 · 전체 기간 누적' : period === 'week' ? '최근 7일 합계 · 일자별 집계 추가 시점부터' : '오늘(UTC) · 일자별 집계 추가 시점부터'}
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tool</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">아직 데이터가 없습니다 {period !== 'all' && '(집계 시작 후 쌓입니다)'}</td></tr>
                  ) : rows.map((t, i) => (
                    <tr key={t.slug} className="hover:bg-gray-50">
                      <td className={'px-4 py-3 font-bold ' + (i < 3 ? 'text-amber-500' : 'text-gray-400')}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <a href={'/' + params.lang + '/tools/' + t.slug} target="_blank" rel="noopener noreferrer"
                          className="font-mono text-gray-700 hover:text-brand-600 hover:underline">{t.slug}</a>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{t.category}</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-600">{t.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {stats && stats.topTools.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 툴 사용량 (로그인 유저)</h2>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tool</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Uses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topTools.map((t) => (
                  <tr key={t.slug} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{t.slug}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats && stats.recentUsers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 가입자 (최대 20명)</h2>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">가입일</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">최근 로그인</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">인증</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{u.displayName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString('ko-KR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.emailVerified ? '✅' : '⬜'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
