import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const FREE_DAILY_LIMIT = 10

function todayKey() {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

export async function POST(req: NextRequest) {
  try {
    const { slug, action } = await req.json() as { slug: string; action: 'check' | 'increment' }

    if (!slug || !action) {
      return NextResponse.json({ error: 'Missing slug or action' }, { status: 400 })
    }

    // Extract uid from Authorization header (Firebase ID token)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      // Not logged in — allow freely (no server-side limit)
      return NextResponse.json({ allowed: true, count: 0, limit: FREE_DAILY_LIMIT, isGuest: true })
    }

    const idToken = authHeader.slice(7)
    let uid: string
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const today = todayKey()
    const docRef = adminDb.collection('users').doc(uid).collection('dailyUsage').doc(today)

    if (action === 'check') {
      const snap = await docRef.get()
      const data = snap.data() ?? {}
      const count = (data[slug] ?? 0) as number

      // Check if user is Pro
      const userDoc = await adminDb.collection('users').doc(uid).get()
      const isPro = userDoc.data()?.isPro === true

      return NextResponse.json({
        allowed: isPro || count < FREE_DAILY_LIMIT,
        count,
        limit: isPro ? null : FREE_DAILY_LIMIT,
        isPro,
      })
    }

    if (action === 'increment') {
      // Check limit before incrementing
      const snap = await docRef.get()
      const data = snap.data() ?? {}
      const count = (data[slug] ?? 0) as number

      const userDoc = await adminDb.collection('users').doc(uid).get()
      const isPro = userDoc.data()?.isPro === true

      if (!isPro && count >= FREE_DAILY_LIMIT) {
        return NextResponse.json({ allowed: false, count, limit: FREE_DAILY_LIMIT, isPro })
      }

      await docRef.set(
        { [slug]: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      )

      return NextResponse.json({ allowed: true, count: count + 1, limit: isPro ? null : FREE_DAILY_LIMIT, isPro })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[usage]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const today = todayKey()
    const snap = await adminDb.collection('users').doc(uid).collection('dailyUsage').doc(today).get()
    const userSnap = await adminDb.collection('users').doc(uid).get()
    const isPro = userSnap.data()?.isPro === true

    return NextResponse.json({
      date: today,
      usage: snap.data() ?? {},
      isPro,
      limit: isPro ? null : FREE_DAILY_LIMIT,
    })
  } catch (err) {
    console.error('[usage GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
