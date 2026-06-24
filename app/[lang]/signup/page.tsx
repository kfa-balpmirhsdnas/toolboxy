'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth'

export default function SignupPage({ params }: { params: { lang: string } }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  function friendlyError(code: string) {
    if (code === 'auth/email-already-in-use') return 'This email is already registered. Try logging in.'
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
    if (code === 'auth/invalid-email') return 'Invalid email address.'
    return 'Something went wrong. Please try again.'
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      router.replace(`/${params.lang}/dashboard`)
    } catch (err: unknown) { setError(friendlyError((err as { code?: string }).code ?? '')) }
    finally { setLoading(false) }
  }

  async function handleGoogle() {
    setError(''); setGoogleLoading(true)
    try { await signInWithPopup(auth, new GoogleAuthProvider()); router.replace(`/${params.lang}/dashboard`) }
    catch (err: unknown) { const c = (err as { code?: string }).code ?? ''; if (c !== 'auth/popup-closed-by-user') setError(friendlyError(c)) }
    finally { setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href={`/${params.lang}`} className="flex justify-center mb-8">
          <span className="font-bold text-2xl text-brand-600">Tool<span className="text-gray-900">Boxy</span></span>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Free forever — no credit card required</p>
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-60">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" /></div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">⚠ {error}</p>}
          {!showEmail ? (
            <button onClick={() => setShowEmail(true)}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-brand-600 py-2 transition-colors">
              Sign up with email
            </button>
          ) : (
            <form onSubmit={handleEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Min. 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-400 text-center mt-4">By signing up you agree to our{' '}
            <Link href={`/${params.lang}/terms`} className="hover:underline">Terms</Link>{' '}and{' '}
            <Link href={`/${params.lang}/privacy`} className="hover:underline">Privacy Policy</Link></p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account?{' '}
          <Link href={`/${params.lang}/login`} className="text-brand-600 font-medium hover:underline">Log in</Link></p>
      </div>
    </div>
  )
}