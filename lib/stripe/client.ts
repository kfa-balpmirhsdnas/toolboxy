import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    limits: {
      uploadsPerDay: 10,
      maxFileSizeMB: 10,
      batchSize: 1,
    },
    features: [
      '10 uploads/day',
      '10MB max file size',
      'All basic tools',
      'No watermark',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      uploadsPerDay: 500,
      maxFileSizeMB: 100,
      batchSize: 20,
    },
    features: [
      '500 uploads/day',
      '100MB max file size',
      'Batch processing (20 files)',
      'Priority processing',
      'API access',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 29,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    limits: {
      uploadsPerDay: -1, // unlimited
      maxFileSizeMB: 500,
      batchSize: 100,
    },
    features: [
      'Unlimited uploads',
      '500MB max file size',
      'Batch processing (100 files)',
      'Priority processing',
      'API access',
      'Team sharing (5 seats)',
      'Dedicated support',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS
