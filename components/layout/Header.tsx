'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JA' },
  { code: 'ko', label: 'KO' },
]

function getCurrentLang(pathname: string): string {
  const seg = pathname.split('/')[1]
  return ['en', 'ja', 'ko'].includes(seg) ? seg : 'en'
}

function switchLang(pathname: string, newLang: string): string {
  const parts = pathname.split('/')
  if (['en', 'ja', 'ko'].includes(parts[1])) {
    parts[1] = newLang
    return parts.join('/')
  }
  return `/${newLang}${pathname}`
}

function Avatar({ user }: { user: User }) {
  if (user.photoURL) return <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
  const initial = (user.displayName ?? user.email ?? '?')[0].toUpperCase()
  return <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{initial}</div>
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const lang = getCurrentLang(pathname)
  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSignOut = async () => { await signOut(auth); setMenuOpen(false); router.push(`/${lang}`) }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href={`/${lang}`} className="font-bold text-xl text-brand-600">Tool<span className="text-gray-900">Boxy</span></Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600 flex-1">
          <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">Tools</Link>
          <Link href={`/${lang}/pricing`} className="hover:text-brand-600 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-1">
          {LANGS.map((l) => (
            <Link key={l.code} href={switchLang(pathname, l.code)}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${lang === l.code ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-brand-600'}`}>
              {l.label}
            </Link>
          ))}
        </div>
        {user === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar user={user} />
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-900 truncate">{user.displayName ?? user.email}</p>
                  {user.displayName && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                </div>
                <Link href={`/${lang}/dashboard`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>📊</span> Dashboard</Link>
                <Link href={`/${lang}/pricing`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>💳</span> Upgrade Plan</Link>
                <hr className="my-1 border-gray-100" />
                <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"><span>🚪</span> Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href={`/${lang}/login`} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Log In</Link>
            <Link href={`/${lang}/signup`} className="btn-primary text-sm py-2 px-4">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  )
}