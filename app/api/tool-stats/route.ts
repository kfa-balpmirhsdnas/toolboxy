import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getToolBySlug } from '@/lib/tools/registry'

/**
 * Per-tool view counter. Called (fire-and-forget) when a tool page loads.
 * Increments toolStats/{slug}.views. Slug is validated against the registry
 * so arbitrary values can't create junk documents.
 *
 * Note: single-document increment — fine at current scale. If a tool ever
 * sustains >~1 view/sec, switch to a sharded counter.
 */
export async function POST(req: NextRequest) {
  try {
    const { slug } = (await req.json()) as { slug?: string }

    if (!slug || !getToolBySlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // One batch: all-time per-tool total + a per-day doc (slug -> count) so the
    // admin dashboard can rank by today / this week. Date is UTC to match reads.
    const today = new Date().toISOString().slice(0, 10)
    const batch = adminDb.batch()
    batch.set(
      adminDb.collection('toolStats').doc(slug),
      { slug, views: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    )
    batch.set(
      adminDb.collection('toolStatsDaily').doc(today),
      { [slug]: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    )
    await batch.commit()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[tool-stats]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
