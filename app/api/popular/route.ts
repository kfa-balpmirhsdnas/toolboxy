import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getToolBySlug } from '@/lib/tools/registry'

// Public read of the auto-computed "popular tools" ranking, derived from the
// per-tool click counter (toolStats/{slug}.views, written by /api/tool-stats on
// every tool-page load). Returns the top-N slugs by all-time views. CDN-cached so
// it stays cheap; never throws to the client (empty list on error).

export const dynamic = 'force-dynamic'
const TOP_N = 20

export async function GET() {
  let slugs: string[] = []
  try {
    const snap = await adminDb.collection('toolStats').get()
    slugs = snap.docs
      .map((d) => {
        const v = d.data() as { slug?: string; views?: number }
        return { slug: v.slug ?? d.id, views: v.views ?? 0 }
      })
      .filter((r) => getToolBySlug(r.slug))
      .sort((a, b) => b.views - a.views)
      .slice(0, TOP_N)
      .map((r) => r.slug)
  } catch (e) {
    console.error('[api/popular]', e)
  }
  return NextResponse.json(
    { slugs },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  )
}
