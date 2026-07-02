import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getToolBySlug } from '@/lib/tools/registry'

// Hourly job (Vercel Cron, see vercel.json) that pre-computes the popular-tools
// ranking once and stores it in a single doc (config/popularTools). /api/popular
// then reads just that one doc instead of scanning the whole toolStats collection
// on every cache miss — turning hundreds of reads per refresh into one.
// Protected by CRON_SECRET (Vercel sends `Authorization: Bearer <CRON_SECRET>`);
// also callable manually with the same header to bootstrap the doc.

export const dynamic = 'force-dynamic'
// Store a buffer of 50 so /api/popular can subtract admin-hidden tools and still
// return a full top-20 to the home page.
const TOP_N = 50

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const snap = await adminDb.collection('toolStats').get()
    const slugs = snap.docs
      .map((d) => {
        const v = d.data() as { slug?: string; views?: number }
        return { slug: v.slug ?? d.id, views: v.views ?? 0 }
      })
      .filter((r) => getToolBySlug(r.slug))
      .sort((a, b) => b.views - a.views)
      .slice(0, TOP_N)
      .map((r) => r.slug)
    await adminDb.collection('config').doc('popularTools').set({ slugs, updatedAt: Date.now() })
    return NextResponse.json({ ok: true, count: slugs.length })
  } catch (e) {
    console.error('[cron/popular]', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
