'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe/client'
import { auth } from '@/lib/firebase/client'

const PLAN_ORDER = ['free', 'pro', 'business'] as const

export default function PricingPage({ params }: { params: { lang: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planId: string) {
    if (planId === 'free') return

    const user = auth.currentUser
    if (!user) {
      router.push(`/${params.lang}/login?redirect=/pricing`)
      return
    }

    setLoading(planId)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/${params.lang}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/${params.lang}/pricing`,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Something went wrong')
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-500">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId]
            const isPopular = planId === 'pro'

            return (
              <div
                key={planId}
                className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 flex flex-col ${
                  isPopular ? 'border-brand-500' : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={planId === 'free' || loading === planId}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    planId === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : isPopular
                      ? 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60'
                      : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60'
                  }`}
                >
                  {loading === planId
                    ? 'Redirecting…'
                    : planId === 'free'
                    ? 'Current Plan'
                    : `Get ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel with one click from your dashboard. You keep access until the end of the billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'All major credit cards (Visa, Mastercard, Amex) and PayPal via Stripe.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The Free plan is always free. Pro and Business plans start billing immediately but you can cancel anytime.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 7-day refund policy. Contact support@toolboxy.net within 7 days of purchase.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
