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

  try {
    // 1. Recent users (last 50)
    const listResult = await adminAuth.listUsers(50)
    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email ?? '',
      displayName: u.displayName ?? '',
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime,
      emailVerified: u.emailVerified,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 2. Today's usage aggregated across all users
    const today = new Date().toISOString().slice(0, 10)
    const usageDocs = await adminDb.collectionGroup('dailyUsage')
      .where('__name__', '>=', `users//dailyUsage/${today}`)
      .get()
      .catch(() => null)

    // Simpler: scan all users' today doc
    const toolTotals: Record<string, number> = {}
    const usersSnap = await adminDb.collection('users').listDocuments()
    await Promise.all(
      usersSnap.slice(0, 200).map(async (ref) => {
        const snap = await ref.collection('dailyUsage').doc(today).get()
        const data = snap.data()
        if (!data) return
        for (const [slug, count] of Object.entries(data)) {
          if (slug === 'updatedAt') continue
          toolTotals[slug] = (toolTotals[slug] ?? 0) + (count as number)
        }
      })
    )

    // Sort tools by usage
    const topTools = Object.entries(toolTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([slug, count]) => ({ slug, count }))

    // 3. All-time per-tool clicks (every visitor, guests included) from the
    // self-hosted toolStats view counter — the real "most clicked" ranking.
    const statsSnap = await adminDb.collection('toolStats').get()
    const topViewed = statsSnap.docs
      .map((d) => {
        const v = d.data() as { slug?: string; views?: number }
        const slug = v.slug ?? d.id
        return { slug, views: v.views ?? 0, category: getToolBySlug(slug)?.category ?? '—' }
      })
      .sort((a, b) => b.views - a.views)
    const totalViews = topViewed.reduce((s, t) => s + t.views, 0)

    // 4. Total user count
    const totalUsers = listResult.users.length // approximate

    return NextResponse.json({
      totalUsers,
      recentUsers: users.slice(0, 20),
      topTools,
      topViewed: topViewed.slice(0, 30),
      totalViews,
      today,
    })
  } catch (err) {
    console.error('[admin/stats]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
