'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

function getLang(pathname: string): string {
  const seg = pathname.split('/')[1]
  return ['en', 'ja', 'ko'].includes(seg) ? seg : 'en'
}

export default function Footer() {
  const pathname = usePathname()
  const lang = getLang(pathname)
  const t = useTranslations('footer')
  const tn = useTranslations('nav')
  const tc = useTranslations('categories')
  const year = new Date().getFullYear()

  const cats = ['pdf', 'image', 'video', 'developer'] as const

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold text-xl text-white mb-2">
            Tool<span className="text-brand-400">Boxy</span>
          </div>
          <p className="text-sm">{t('tagline')}</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t('tools')}</h4>
          <ul className="space-y-2 text-sm">
            {cats.map((cat) => (
              <li key={cat}>
                <Link href={`/${lang}/tools/${cat}`} className="hover:text-white transition-colors">
                  {tc(cat)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t('company')}</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: t('about'), href: `/${lang}/about` },
              { label: tn('blog'), href: `/${lang}/blog` },
              { label: tn('pricing'), href: `/${lang}/pricing` },
              { label: t('contact'), href: `/${lang}/contact` },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t('legal')}</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: t('privacy'), href: `/${lang}/privacy` },
              { label: t('terms'), href: `/${lang}/terms` },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 px-4">
        <p className="text-center text-xs text-gray-600">
          © {year} ToolBoxy. {t('rights')}
        </p>
      </div>
    </footer>
  )
}
