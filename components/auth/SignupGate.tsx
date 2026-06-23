'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { auth } from '@/lib/firebase/client'

/**
 * Sign-up gate for guest users who reach an individual tool via internal
 * navigation (Home / Tools listing). Direct entries (Google, bookmark, typed
 * URL) are NOT gated — they never click an internal tool link, so this gate is
 * never triggered for them.
 *
 * Behaviour:
 *  - Logged-in users        -> navigate freely.
 *  - Guests, first internal -> sign-up modal with a "continue anyway" escape.
 *  - Guests, after "continue" once in a session -> navigate freely (no nag).
 */

interface GateCtx {
  /** Returns true if navigation may proceed; false if the gate was shown. */
  guard: (href: string) => boolean
}

const Ctx = createContext<GateCtx | null>(null)

export function useSignupGate(): GateCtx {
  return useContext(Ctx) ?? { guard: () => true }
}

function getLang(pathname: string): string {
  const seg = pathname.split('/')[1]
  return ['en', 'ja', 'ko'].includes(seg) ? seg : 'en'
}

export default function SignupGateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const lang = getLang(pathname)
  const t = useTranslations('gate')

  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  const guard = useCallback(
    (href: string): boolean => {
      // Allow while auth state is still resolving (avoid false gate / flicker)
      // and for logged-in users. Guests are prompted on every internal tool
      // navigation (the "continue anyway" escape is not remembered).
      if (user === 'loading' || user) return true
      setPendingHref(href)
      return false
    },
    [user],
  )

  const close = () => setPendingHref(null)

  const continueAnyway = () => {
    const href = pendingHref
    setPendingHref(null)
    if (href) router.push(href)
  }

  return (
    <Ctx.Provider value={{ guard }}>
      {children}
      {pendingHref && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t('desc')}</p>
            <Link
              href={`/${lang}/signup`}
              onClick={close}
              className="block w-full bg-brand-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-brand-700 transition-colors mb-3"
            >
              {t('create')}
            </Link>
            <Link
              href={`/${lang}/login`}
              onClick={close}
              className="block w-full text-center text-sm text-brand-600 hover:text-brand-700 py-1 mb-2"
            >
              {t('signin')}
            </Link>
            <button
              onClick={continueAnyway}
              className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              {t('continue')} →
            </button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
