'use client'

import { useSyncExternalStore } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

// Single Firebase auth subscription shared across the whole app. Header and the sign-up gate (and
// anything else) read the same store instead of each calling onAuthStateChanged, so there is only
// ONE listener / token watcher regardless of how many components need the user.

export type AuthState = User | null | 'loading'

let current: AuthState = 'loading'
const listeners = new Set<() => void>()
let started = false

function ensureStarted() {
  if (started || typeof window === 'undefined') return
  started = true
  onAuthStateChanged(auth, (u) => {
    current = u
    listeners.forEach((l) => l())
  })
}

function subscribe(cb: () => void): () => void {
  ensureStarted()
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

const getSnapshot = (): AuthState => current
const getServerSnapshot = (): AuthState => 'loading'

export function useAuthUser(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
