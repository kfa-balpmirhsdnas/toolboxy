import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Public read of the popular-tools ranking. The ranking is pre-computed hourly by
// /api/cron/popular into config/popularTools, so this is a SINGLE doc read (not a
// full toolStats collection scan). CDN-cached for an hour; never throws (empty
// list on error / before the first cron run).

export const dynamic = 'force-dynamic'

// How many popular tools the home page shows (after subtracting admin-hidden ones).
const SHOW_N = 20

export async function GET() {
  let slugs: string[] = []
  try {
    const [rankSnap, hiddenSnap] = await Promise.all([
      adminDb.collection('config').doc('popularTools').get(),
      adminDb.collection('config').doc('popularHidden').get(),
    ])
    const ranked = (rankSnap.data() as { slugs?: string[] } | undefined)?.slugs
    const hidden = new Set((hiddenSnap.data() as { slugs?: string[] } | undefined)?.slugs ?? [])
    if (Array.isArray(ranked)) slugs = ranked.filter((s) => !hidden.has(s)).slice(0, SHOW_N)
  } catch (e) {
    console.error('[api/popular]', e)
  }
  return NextResponse.json(
    { slugs },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
