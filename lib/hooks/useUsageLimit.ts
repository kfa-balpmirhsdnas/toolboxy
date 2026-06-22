import { useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'

interface UsageState {
  allowed: boolean
  count: number
  limit: number | null
  isPro: boolean
  isGuest: boolean
  loading: boolean
}

/**
 * Hook for tool usage limiting.
 *
 * Usage:
 *   const { allowed, count, limit, increment } = useUsageLimit('csv-to-json')
 *
 * Call `increment()` when the user performs a meaningful action (Copy / Download).
 * It returns `true` if allowed, `false` if limit reached.
 */
export function useUsageLimit(slug: string) {
  const [state, setState] = useState<UsageState>({
    allowed: true,
    count: 0,
    limit: 10,
    isPro: false,
    isGuest: true,
    loading: false,
  })

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const user = getAuth().currentUser
      if (!user) return null
      return await user.getIdToken()
    } catch {
      return null
    }
  }, [])

  const increment = useCallback(async (): Promise<boolean> => {
    const token = await getToken()
    if (!token) return true // guest: allow freely

    setState(s => ({ ...s, loading: true }))
    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, action: 'increment' }),
      })
      const data = await res.json()
      setState({
        allowed: data.allowed,
        count: data.count,
        limit: data.limit,
        isPro: data.isPro ?? false,
        isGuest: false,
        loading: false,
      })
      return data.allowed
    } catch {
      setState(s => ({ ...s, loading: false }))
      return true // fail open
    }
  }, [slug, getToken])

  const check = useCallback(async () => {
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, action: 'check' }),
      })
      const data = await res.json()
      setState({
        allowed: data.allowed,
        count: data.count,
        limit: data.limit,
        isPro: data.isPro ?? false,
        isGuest: data.isGuest ?? false,
        loading: false,
      })
    } catch { /* fail open */ }
  }, [slug, getToken])

  return { ...state, increment, check }
}
