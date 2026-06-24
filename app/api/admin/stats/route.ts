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
  let recentUsers: Array<Record<string, unknown>> = []
  let totalUsers = 0
  let topTools: Array<{ slug: string; count: number }> = []
  let topViewed: Array<{ slug: string; views: number; category: string }> = []
  let totalViews = 0

  // Each section is isolated so one failure can't blank the whole dashboard.

  // 1. Recent signups
  try {
    const listResult = await adminAuth.listUsers(1000)
    totalUsers = listResult.users.length
    recentUsers = listResult.users
      .map((u) => ({
        uid: u.uid,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        createdAt: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime,
        emailVerified: u.emailVerified,
      }))
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
    topViewed = all.slice(0, 30)
  } catch (e) {
    console.error('[admin/stats toolStats]', e)
  }

  return NextResponse.json({ totalUsers, recentUsers, topTools, topViewed, totalViews, today })
}
