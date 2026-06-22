import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { adminDb } from '@/lib/firebase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(sub)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(sub)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
      default:
        console.log(`[webhook] unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error(`[webhook] handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.CheckoutSession) {
  const uid = session.metadata?.firebaseUid
  const planId = session.metadata?.planId
  if (!uid || !planId) return

  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  await adminDb.collection('users').doc(uid).set(
    {
      plan: planId,
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: subscription.status,
      planUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const uid = sub.metadata?.firebaseUid
  if (!uid) {
    const snapshot = await adminDb
      .collection('users')
      .where('stripeCustomerId', '==', sub.customer)
      .limit(1)
      .get()
    if (snapshot.empty) return
    const doc = snapshot.docs[0]
    await updateUserSubscription(doc.id, sub)
    return
  }
  await updateUserSubscription(uid, sub)
}

async function updateUserSubscription(uid: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id
  const planId = getPlanByPriceId(priceId) ?? 'free'

  await adminDb.collection('users').doc(uid).set(
    {
      plan: sub.status === 'active' ? planId : 'free',
      stripeSubscriptionId: sub.id,
      stripeSubscriptionStatus: sub.status,
      planUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const snapshot = await adminDb
    .collection('users')
    .where('stripeSubscriptionId', '==', sub.id)
    .limit(1)
    .get()

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.set(
      {
        plan: 'free',
        stripeSubscriptionStatus: 'canceled',
        planUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const snapshot = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get()

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.set(
      { stripeSubscriptionStatus: 'past_due' },
      { merge: true }
    )
  }
}

function getPlanByPriceId(priceId?: string): string | null {
  if (!priceId) return null
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID
  const bizPriceId = process.env.STRIPE_BUSINESS_PRICE_ID
  if (priceId === proPriceId) return 'pro'
  if (priceId === bizPriceId) return 'business'
  return null
}
