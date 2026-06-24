'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { auth } from '@/lib/firebase/client'

// Native language names (endonyms) — each shown in its own language so any
// speaker recognizes it. Avoid flags: they represent countries, not languages.
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

// Owner-only menu entry; the /admin page enforces this server-side too.
const ADMIN_EMAILS = ['sandshrimp.lab@gmail.com']

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
  const t = useTranslations('nav')
  const th = useTranslations('home')
  const [user, setUser] = useState<User | null | 'loading'>('loading')
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const currentLangLabel = LANGS.find((l) => l.code === lang)?.label ?? 'English'

  const handleSignOut = async () => { await signOut(auth); setMenuOpen(false); router.push(`/${lang}`) }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2 sm:gap-4">
        <Link href={`/${lang}`} className="font-bold text-xl text-brand-600 shrink-0 whitespace-nowrap">Tool<span className="text-gray-900">Boxy</span></Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-400 flex-1">
          <span className="hidden sm:inline">{th('hero_title')}</span>
        </nav>
        {/* Desktop: segmented control with native names (even spacing) */}
        <div className="hidden sm:flex items-center bg-gray-200 rounded-lg p-0.5 shrink-0">
          {LANGS.map((l) => (
            <Link key={l.code} href={switchLang(pathname, l.code)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${lang === l.code ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile: compact globe dropdown */}
        <div className="relative shrink-0 sm:hidden" ref={langRef}>
          <button onClick={() => setLangOpen((o) => !o)} aria-label="Change language"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" /></svg>
            <span className="whitespace-nowrap">{currentLangLabel}</span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-11 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              {LANGS.map((l) => (
                <Link key={l.code} href={switchLang(pathname, l.code)} onClick={() => setLangOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${lang === l.code ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Reserve a stable width so loading↔resolved doesn't shift the header */}
        <div className="flex items-center justify-end shrink-0 min-w-[88px]">
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
                <Link href={`/${lang}/dashboard`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>📊</span> {t('dashboard')}</Link>
                {user.email && ADMIN_EMAILS.includes(user.email) && (
                  <Link href={`/${lang}/admin`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>🛠</span> Admin</Link>
                )}
                {/* UPGRADE_HIDDEN <Link href={`/${lang}/pricing`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>💳</span> Upgrade Plan</Link> UPGRADE_HIDDEN */}
                <hr className="my-1 border-gray-100" />
                <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"><span>🚪</span> {t('logout')}</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/${lang}/login`} className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors whitespace-nowrap">{t('login')}</Link>
            <Link href={`/${lang}/signup`} className="btn-primary text-sm py-1.5 px-3 sm:px-4 whitespace-nowrap">{t('signup')}</Link>
          </div>
        )}
        </div>
      </div>
    </header>
  )
}