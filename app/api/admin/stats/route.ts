import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { getToolBySlug } from '@/lib/tools/registry'

const ADMIN_EMAILS = ['sandshrimp.lab@gmail.com']

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7))
    if (!ADMIN_EMAILS.includes(decoded.email ?? '')) return null
    return decoded.uid
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const today = new Date().toISOString().slice(0, 10)
  type Ranked = { slug: string; views: number; category: string }
  let recentUsers: Array<Record<string, unknown>> = []
  let totalUsers = 0
  let topTools: Array<{ slug: string; count: number }> = []
  let topViewed: Ranked[] = []
  let topWeek: Ranked[] = []
  let topToday: Ranked[] = []
  let totalViews = 0

  const rank = (totals: Record<string, number>): Ranked[] =>
    Object.entries(totals)
      .map(([slug, views]) => ({ slug, views, category: getToolBySlug(slug)?.category ?? '—' }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 30)

  // Each section is isolated so one failure can't blank the whole dashboard.

  // 1. Recent signups + accurate total (paginate all users)
  try {
    const all: Array<{ uid: string; email: string; displayName: string; createdAt: string; lastSignIn: string; emailVerified: boolean }> = []
    let pageToken: string | undefined
    do {
      const res = await adminAuth.listUsers(1000, pageToken)
      for (const u of res.users) {
        all.push({
          uid: u.uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          createdAt: u.metadata.creationTime,
          lastSignIn: u.metadata.lastSignInTime,
          emailVerified: u.emailVerified,
        })
      }
      pageToken = res.pageToken
    } while (pageToken)
    totalUsers = all.length
    recentUsers = all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  } catch (e) {
    console.error('[admin/stats users]', e)
  }

  // 2. Today's tool usage by logged-in users (from per-user dailyUsage)
  try {
    const toolTotals: Record<string, number> = {}
    const userRefs = await adminDb.collection('users').listDocuments()
    await Promise.all(
      userRefs.slice(0, 500).map(async (ref) => {
        const snap = await ref.collection('dailyUsage').doc(today).get()
        const data = snap.data()
        if (!data) return
        for (const [slug, count] of Object.entries(data)) {
          if (slug === 'updatedAt' || typeof count !== 'number') continue
          toolTotals[slug] = (toolTotals[slug] ?? 0) + count
        }
      }),
    )
    topTools = Object.entries(toolTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([slug, count]) => ({ slug, count }))
  } catch (e) {
    console.error('[admin/stats usage]', e)
  }

  // 3. All-time per-tool clicks (every visitor, guests included) from toolStats
  try {
    const statsSnap = await adminDb.collection('toolStats').get()
    const all = statsSnap.docs
      .map((d) => {
        const v = d.data() as { slug?: string; views?: number }
        const slug = v.slug ?? d.id
        return { slug, views: v.views ?? 0, category: getToolBySlug(slug)?.category ?? '—' }
      })
      .sort((a, b) => b.views - a.views)
    totalViews = all.reduce((s, t) => s + t.views, 0)
    topViewed = all.slice(0, 50)
  } catch (e) {
    console.error('[admin/stats toolStats]', e)
  }

  // 4. Today / this-week clicks (every visitor) from the per-day docs
  try {
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const dt = new Date()
      dt.setUTCDate(dt.getUTCDate() - i)
      days.push(dt.toISOString().slice(0, 10))
    }
    const refs = days.map((d) => adminDb.collection('toolStatsDaily').doc(d))
    const snaps = await adminDb.getAll(...refs)
    const weekTotals: Record<string, number> = {}
    const todayTotals: Record<string, number> = {}
    snaps.forEach((snap, idx) => {
      const data = snap.data() || {}
      for (const [slug, count] of Object.entries(data)) {
        if (slug === 'updatedAt' || typeof count !== 'number') continue
        weekTotals[slug] = (weekTotals[slug] ?? 0) + count
        if (idx === 0) todayTotals[slug] = (todayTotals[slug] ?? 0) + count
      }
    })
    topWeek = rank(weekTotals)
    topToday = rank(todayTotals)
  } catch (e) {
    console.error('[admin/stats daily]', e)
  }

  return NextResponse.json({ totalUsers, recentUsers, topTools, topViewed, topWeek, topToday, totalViews, today })
}
