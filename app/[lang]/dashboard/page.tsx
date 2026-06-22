'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase/client'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { PLANS, type PlanId } from '@/lib/stripe/plans'

interface SubscriptionData {
  plan: PlanId
  status: string | null
  updatedAt: string | null
}

const PLAN_BADGE: Record<PlanId, { label: string; color: string }> = {
  free:     { label: 'Free',     color: 'bg-gray-100 text-gray-700' },
  pro:      { label: 'Pro',      color: 'bg-brand-100 text-brand-700' },
  business: { label: 'Business', color: 'bg-purple-100 text-purple-700' },
}

export default function DashboardPage({ params }: { params: { lang: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sub, setSub] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace(`/${params.lang}/login?redirect=/dashboard`)
        return
      }
      setUser(u)

      // Fetch subscription
      try {
        const token = await u.getIdToken()
        const res = await fetch('/api/stripe/subscription', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setSub(data)
        }
      } catch {
        // Stripe not configured yet — default to free plan
      }
      setLoading(false)
    })
    return unsub
  }, [params.lang, router])

  async function handleUpgrade(planId: 'pro' | 'business') {
    if (!user) return
    const token = await user.getIdToken()
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        planId,
        successUrl: `${window.location.origin}/${params.lang}/dashboard?upgraded=true`,
        cancelUrl: `${window.location.origin}/${params.lang}/dashboard`,
      }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  async function handlePortal() {
    if (!user) return
    setPortalLoading(true)
    const token = await user.getIdToken()
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ returnUrl: window.location.href }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setPortalLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const plan = (sub?.plan ?? 'free') as PlanId
  const planData = PLANS[plan]
  const badge = PLAN_BADGE[plan]
  const isPaid = plan !== 'free'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">
              {(user?.displayName ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.displayName ?? 'My Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Current Plan</h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Uploads / day</p>
              <p className="font-bold text-gray-900 text-lg">
                {planData.limits.uploadsPerDay === -1 ? '∞' : planData.limits.uploadsPerDay}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Max file size</p>
              <p className="font-bold text-gray-900 text-lg">{planData.limits.maxFileSizeMB} MB</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Batch size</p>
              <p className="font-bold text-gray-900 text-lg">{planData.limits.batchSize} files</p>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {planData.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span> {f}
              </li>
            ))}
          </ul>

          {isPaid ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn-secondary w-full py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {portalLoading ? 'Opening…' : 'Manage Subscription'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleUpgrade('pro')}
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Upgrade to Pro — $9/mo
              </button>
              <button
                onClick={() => handleUpgrade('business')}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Upgrade to Business — $29/mo
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/${params.lang}/tools`}
              className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm font-medium text-gray-700"
            >
              <span>🔧</span> Browse Tools
            </Link>
            <Link
              href={`/${params.lang}/pricing`}
              className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm font-medium text-gray-700"
            >
              <span>💳</span> Pricing
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
