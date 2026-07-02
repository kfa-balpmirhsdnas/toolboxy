'use client'

import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'

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

  // 추천 도구 관리 — admin-selected, ordered list saved to config/featuredTools.
  const [featured, setFeatured] = useState<string[]>([])
  const [savedFeatured, setSavedFeatured] = useState<string[]>([])
  const [featLoaded, setFeatLoaded] = useState(false)
  const [featSaving, setFeatSaving] = useState(false)
  const [featMsg, setFeatMsg] = useState('')
  const [featSearch, setFeatSearch] = useState('')

  // 인기 도구 관리 — admin-hidden slugs subtracted from the auto popular ranking (config/popularHidden).
  const [hiddenPop, setHiddenPop] = useState<string[]>([])
  const [savedHiddenPop, setSavedHiddenPop] = useState<string[]>([])
  const [popLoaded, setPopLoaded] = useState(false)
  const [popSaving, setPopSaving] = useState(false)
  const [popMsg, setPopMsg] = useState('')

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

      // Load the saved featured-tools list.
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/admin/featured', {
          headers: { Authorization: 'Bearer ' + token }
        })
        const data = await res.json()
        if (res.ok) { setFeatured(data.slugs ?? []); setSavedFeatured(data.slugs ?? []) }
      } catch { /* leave empty */ } finally {
        setFeatLoaded(true)
      }

      // Load the admin-hidden popular slugs.
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/admin/popular-hidden', { headers: { Authorization: 'Bearer ' + token } })
        const data = await res.json()
        if (res.ok) { setHiddenPop(data.slugs ?? []); setSavedHiddenPop(data.slugs ?? []) }
      } catch { /* leave empty */ } finally {
        setPopLoaded(true)
      }
    })
  }, [])

  const featDirty = JSON.stringify(featured) !== JSON.stringify(savedFeatured)
  const moveFeatured = (i: number, dir: -1 | 1) => setFeatured((prev) => {
    const j = i + dir
    if (j < 0 || j >= prev.length) return prev
    const a = [...prev];[a[i], a[j]] = [a[j], a[i]]; return a
  })
  const addFeatured = (slug: string) => setFeatured((p) => (p.includes(slug) ? p : [...p, slug]))
  const removeFeatured = (slug: string) => setFeatured((p) => p.filter((s) => s !== slug))
  async function saveFeatured() {
    setFeatSaving(true); setFeatMsg('')
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: featured }),
      })
      const data = await res.json()
      if (res.ok) { setFeatured(data.slugs); setSavedFeatured(data.slugs); setFeatMsg('저장됨 ' + new Date().toLocaleTimeString('ko-KR')) }
      else setFeatMsg('오류: ' + (data.error ?? '저장 실패'))
    } catch { setFeatMsg('오류: 저장 실패') } finally { setFeatSaving(false) }
  }

  // 인기 도구 — hide/show toggle + save (order-independent set).
  const popDirty = JSON.stringify([...hiddenPop].sort()) !== JSON.stringify([...savedHiddenPop].sort())
  const hiddenPopSet = useMemo(() => new Set(hiddenPop), [hiddenPop])
  const toggleHidePop = (slug: string) => setHiddenPop((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]))
  async function saveHiddenPop() {
    setPopSaving(true); setPopMsg('')
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/admin/popular-hidden', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: hiddenPop }),
      })
      const data = await res.json()
      if (res.ok) { setHiddenPop(data.slugs); setSavedHiddenPop(data.slugs); setPopMsg('저장됨 ' + new Date().toLocaleTimeString('ko-KR')) }
      else setPopMsg('오류: ' + (data.error ?? '저장 실패'))
    } catch { setPopMsg('오류: 저장 실패') } finally { setPopSaving(false) }
  }

  // Tools available to add (not already featured), filtered by the search box.
  const featuredSet = useMemo(() => new Set(featured), [featured])
  const addCandidates = useMemo(() => {
    const q = featSearch.trim().toLowerCase()
    return TOOLS
      .filter((t) => !featuredSet.has(t.slug))
      .filter((t) => !q || t.slug.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)))
  }, [featSearch, featuredSet])
  const catLabel = (c: ToolCategory) => CATEGORY_META[c]?.label ?? c

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

      {/* 추천 도구 관리 */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h2 className="text-lg font-semibold text-gray-800">💼 추천 도구 관리</h2>
          <div className="flex items-center gap-3">
            {featMsg && <span className="text-xs text-gray-500">{featMsg}</span>}
            {featDirty && <span className="text-xs text-amber-600">● 저장 안 됨</span>}
            <button
              onClick={saveFeatured}
              disabled={featSaving || !featDirty}
              className={'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ' + (featSaving || !featDirty ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700')}>
              {featSaving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">메인 페이지 추천 도구 섹션에 노출됩니다. 저장 위치: Firestore <code className="font-mono">config/featuredTools</code></p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 선택된 추천 도구 (순서 조정) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              선택된 추천 도구 <span className="text-brand-600">{featured.length}</span>
            </div>
            {!featLoaded ? (
              <p className="px-4 py-8 text-center text-gray-400 text-sm">불러오는 중…</p>
            ) : featured.length === 0 ? (
              <p className="px-4 py-8 text-center text-gray-400 text-sm">오른쪽 목록에서 추천할 도구를 추가하세요.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {featured.map((slug, i) => {
                  const t = TOOLS.find((x) => x.slug === slug)
                  return (
                    <li key={slug} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                      <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-gray-700 truncate">{slug}</p>
                        <p className="text-xs text-gray-400">{t ? catLabel(t.category) : '— 없는 도구'}</p>
                      </div>
                      <button onClick={() => moveFeatured(i, -1)} disabled={i === 0}
                        className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent" aria-label="위로">▲</button>
                      <button onClick={() => moveFeatured(i, 1)} disabled={i === featured.length - 1}
                        className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent" aria-label="아래로">▼</button>
                      <button onClick={() => removeFeatured(slug)}
                        className="w-7 h-7 rounded-md text-red-400 hover:bg-red-50" aria-label="제거">✕</button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* 전체 도구에서 추가 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <input
                value={featSearch}
                onChange={(e) => setFeatSearch(e.target.value)}
                placeholder="도구 검색 (slug · 카테고리 · 태그)"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <ul className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto">
              {addCandidates.slice(0, 100).map((t) => (
                <li key={t.slug} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-gray-700 truncate">{t.slug}</p>
                    <p className="text-xs text-gray-400">{catLabel(t.category)}{t.isNew && <span className="ml-1 text-emerald-500">NEW</span>}</p>
                  </div>
                  <button onClick={() => addFeatured(t.slug)}
                    className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-600 text-xs font-semibold hover:bg-brand-100">+ 추가</button>
                </li>
              ))}
              {addCandidates.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">일치하는 도구가 없습니다.</li>
              )}
              {addCandidates.length > 100 && (
                <li className="px-4 py-3 text-center text-gray-400 text-xs">상위 100개만 표시 — 검색으로 좁혀보세요 (전체 {addCandidates.length}개)</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 인기 도구 설정 — hide tools from the auto popular ranking */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h2 className="text-lg font-semibold text-gray-800">🔥 인기 도구 설정</h2>
          <div className="flex items-center gap-3">
            {popMsg && <span className="text-xs text-gray-500">{popMsg}</span>}
            {popDirty && <span className="text-xs text-amber-600">● 저장 안 됨</span>}
            <button onClick={saveHiddenPop} disabled={popSaving || !popDirty}
              className={'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ' + (popSaving || !popDirty ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700')}>
              {popSaving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">클릭수 순 인기 도구. <b>가리기</b>한 항목은 메인 🔥 인기 도구 섹션에서 제외되고, 가리지 않은 <b>상위 20개</b>가 노출됩니다. 저장 위치: Firestore <code className="font-mono">config/popularHidden</code> · 반영까지 최대 1시간(CDN 캐시).</p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {!stats || !popLoaded ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">불러오는 중…</p>
          ) : stats.topViewed.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">아직 클릭 데이터가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[36rem] overflow-y-auto">
              {(() => {
                let visibleRank = 0
                const rows = stats.topViewed.map((tv, i) => {
                  const hidden = hiddenPopSet.has(tv.slug)
                  if (!hidden) visibleRank++
                  const onMain = !hidden && visibleRank <= 20
                  return (
                    <li key={tv.slug} className={'flex items-center gap-2 px-3 py-2 ' + (hidden ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50')}>
                      <span className="w-7 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <a href={'/' + params.lang + '/tools/' + tv.slug} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-gray-700 hover:text-brand-600 hover:underline truncate block">{tv.slug}</a>
                        <p className="text-xs text-gray-400">{tv.category} · {tv.views.toLocaleString()} 클릭{onMain && <span className="ml-1 text-emerald-600 font-medium">· 메인 노출</span>}</p>
                      </div>
                      <button onClick={() => toggleHidePop(tv.slug)}
                        className={'px-2.5 py-1 rounded-md text-xs font-semibold ' + (hidden ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-50 text-red-600 hover:bg-red-100')}>
                        {hidden ? '보이기' : '가리기'}</button>
                    </li>
                  )
                })
                // Hidden slugs that dropped out of the top-50 view — keep them un-hideable here.
                const shown = new Set(stats.topViewed.map((x) => x.slug))
                hiddenPop.filter((s) => !shown.has(s)).forEach((slug) => rows.push(
                  <li key={'orphan-' + slug} className="flex items-center gap-2 px-3 py-2 bg-gray-50 opacity-60">
                    <span className="w-7 text-center text-xs text-gray-300">—</span>
                    <div className="flex-1 min-w-0"><p className="font-mono text-sm text-gray-700 truncate">{slug}</p><p className="text-xs text-gray-400">가려짐 · 현재 상위 50위 밖</p></div>
                    <button onClick={() => toggleHidePop(slug)} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">보이기</button>
                  </li>
                ))
                return rows
              })()}
            </ul>
          )}
        </div>
      </div>

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
              <h2 className="text-lg font-semibold text-gray-800">인기 툴 랭킹 — 클릭수 (게스트 포함)</h2>
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
