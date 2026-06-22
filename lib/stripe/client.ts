import Stripe from 'stripe'

export { PLANS, type PlanId } from './plans'

let _stripe: Stripe | undefined

function getInstance(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return _stripe
}

// Lazy proxy — safe to import on client bundles; throws only when methods are called
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    const s = getInstance()
    const val = (s as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? (val as Function).bind(s) : val
  },
})
