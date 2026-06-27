import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getToolBySlug } from '@/lib/tools/registry'

// Public read of the admin-managed featured-tools list (set via /api/admin/featured,
// stored at config/featuredTools). Consumed by the home page. CDN-cached so admin
// changes propagate within ~a minute without a redeploy. Never throws to the client:
// on any error it returns an empty list so the home page degrades gracefully.

export const dynamic = 'force-dynamic'

export async function GET() {
  let slugs: string[] = []
  try {
    const snap = await adminDb.collection('config').doc('featuredTools').get()
    const data = snap.data() as { slugs?: string[] } | undefined
    slugs = (data?.slugs ?? []).filter((s) => getToolBySlug(s))
  } catch (e) {
    console.error('[api/featured]', e)
  }
  return NextResponse.json(
    { slugs },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
