'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { auth } from '@/lib/firebase/client'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth'

function errorKey(code: string): string {
  if (code === 'auth/email-already-in-use') return 'err_email_in_use'
  if (code === 'auth/weak-password') return 'err_weak_password'
  if (code === 'auth/invalid-email') return 'err_invalid_email'
  return 'err_generic'
}

export default function SignupPage({ params }: { params: { lang: string } }) {
  const router = useRouter()
  const t = useTranslations('auth')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      router.replace(`/${params.lang}/dashboard`)
    } catch (err: unknown) { setError(errorKey((err as { code?: string }).code ?? '')) }
    finally { setLoading(false) }
  }

  async function handleGoogle() {
    setError(''); setGoogleLoading(true)
    try { await signInWithPopup(auth, new GoogleAuthProvider()); router.replace(`/${params.lang}/dashboard`) }
    catch (err: unknown) { const c = (err as { code?: string }).code ?? ''; if (c !== 'auth/popup-closed-by-user') setError(errorKey(c)) }
    finally { setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href={`/${params.lang}`} className="flex justify-center mb-8">
          <span className="font-bold text-2xl text-brand-600">Tool<span className="text-gray-900">Boxy</span></span>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('create_account')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('signup_subtitle')}</p>
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-60">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? t('connecting') : t('continue_google')}
          </button>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">{t('or')}</span><div className="flex-1 h-px bg-gray-200" /></div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">⚠ {t(error)}</p>}
          {!showEmail ? (
            <button onClick={() => setShowEmail(true)}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-brand-600 py-2 transition-colors">
              {t('signup_with_email')}
            </button>
          ) : (
            <form onSubmit={handleEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')} <span className="text-gray-400 font-normal">{t('optional')}</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={t('your_name')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder={t('email_ph')} autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder={t('min6')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                {loading ? t('creating') : t('create_btn')}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-400 text-center mt-4">{t('terms_pre')}{' '}
            <Link href={`/${params.lang}/terms`} className="hover:underline">{t('terms')}</Link>{' '}{t('and')}{' '}
            <Link href={`/${params.lang}/privacy`} className="hover:underline">{t('privacy')}</Link></p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">{t('have_account')}{' '}
          <Link href={`/${params.lang}/login`} className="text-brand-600 font-medium hover:underline">{t('login_link')}</Link></p>
      </div>
    </div>
  )
}
