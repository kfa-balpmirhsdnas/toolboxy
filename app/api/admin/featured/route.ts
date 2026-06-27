import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { getToolBySlug } from '@/lib/tools/registry'

// Admin-managed list of "featured" tools shown on the home page. Stored as a
// single Firestore doc config/featuredTools = { slugs: string[], updatedAt, updatedBy }.
// Same auth pattern as /api/admin/stats (Bearer idToken + email allow-list).

const ADMIN_EMAILS = ['sandshrimp.lab@gmail.com']
const DOC = () => adminDb.collection('config').doc('featuredTools')

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
    const snap = await DOC().get()
    const data = snap.data() as { slugs?: string[]; updatedAt?: string } | undefined
    // Drop any slugs that no longer exist in the registry.
    const slugs = (data?.slugs ?? []).filter((s) => getToolBySlug(s))
    return NextResponse.json({ slugs, updatedAt: data?.updatedAt ?? null })
  } catch (e) {
    console.error('[admin/featured GET]', e)
    return NextResponse.json({ error: 'Failed to load featured tools' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const body = (await req.json()) as { slugs?: unknown }
    if (!Array.isArray(body.slugs)) {
      return NextResponse.json({ error: 'slugs must be an array' }, { status: 400 })
    }
    // Validate against the registry and de-duplicate while preserving order.
    const seen = new Set<string>()
    const slugs: string[] = []
    for (const s of body.slugs) {
      if (typeof s !== 'string' || seen.has(s) || !getToolBySlug(s)) continue
      seen.add(s)
      slugs.push(s)
    }
    const updatedAt = new Date().toISOString()
    await DOC().set({ slugs, updatedAt, updatedBy: uid }, { merge: true })
    return NextResponse.json({ ok: true, slugs, updatedAt })
  } catch (e) {
    console.error('[admin/featured POST]', e)
    return NextResponse.json({ error: 'Failed to save featured tools' }, { status: 500 })
  }
}
