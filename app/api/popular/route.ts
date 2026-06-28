import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Public read of the popular-tools ranking. The ranking is pre-computed hourly by
// /api/cron/popular into config/popularTools, so this is a SINGLE doc read (not a
// full toolStats collection scan). CDN-cached for an hour; never throws (empty
// list on error / before the first cron run).

export const dynamic = 'force-dynamic'

export async function GET() {
  let slugs: string[] = []
  try {
    const snap = await adminDb.collection('config').doc('popularTools').get()
    const data = snap.data() as { slugs?: string[] } | undefined
    if (Array.isArray(data?.slugs)) slugs = data!.slugs
  } catch (e) {
    console.error('[api/popular]', e)
  }
  return NextResponse.json(
    { slugs },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
