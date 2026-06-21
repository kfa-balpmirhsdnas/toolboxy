'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

export default function Header() {
  const pathname = usePathname()
  const lang = getCurrentLang(pathname)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link href={`/${lang}`} className="font-bold text-xl text-brand-600">
          Tool<span className="text-gray-900">Boxy</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600 flex-1">
          <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">
            Tools
          </Link>
          <Link href={`/${lang}/pricing`} className="hover:text-brand-600 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-1">
          {LANGS.map((l) => (
            <Link
              key={l.code}
              href={switchLang(pathname, l.code)}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                lang === l.code
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:text-brand-600'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <Link
          href={`/${lang}/login`}
          className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          Log In
        </Link>
        <Link
          href={`/${lang}/signup`}
          className="btn-primary text-sm py-2 px-4"
        >
          Sign Up
        </Link>
      </div>
    </header>
  )
}
