import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const uid = decodedToken.uid

    const userDoc = await adminDb.collection('users').doc(uid).get()
    const data = userDoc.data()

    return NextResponse.json({
      plan: data?.plan ?? 'free',
      status: data?.stripeSubscriptionStatus ?? null,
      updatedAt: data?.planUpdatedAt ?? null,
    })
  } catch (err: unknown) {
    console.error('[stripe/subscription]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
