import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanId } from '@/lib/stripe/client'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const uid = decodedToken.uid

    const { planId, successUrl, cancelUrl } = await req.json()

    if (!planId || !(planId in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanId]
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Plan has no price' }, { status: 400 })
    }

    // Get or create Stripe customer
    const userDoc = await adminDb.collection('users').doc(uid).get()
    const userData = userDoc.data()
    let customerId: string = userData?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email ?? undefined,
        metadata: { firebaseUid: uid },
      })
      customerId = customer.id
      await adminDb.collection('users').doc(uid).set(
        { stripeCustomerId: customerId },
        { merge: true }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/en/dashboard?upgraded=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/en/pricing`,
      metadata: { firebaseUid: uid, planId },
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { firebaseUid: uid, planId },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
