import { Inter } from 'next/font/google'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import DynamicManifest from '@/components/DynamicManifest'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

// Shared <html>/<body> shell for the app's root layouts. `lang` is set per route
// tree: the locale layout (app/[lang]/layout.tsx) passes params.lang, while the
// non-localized group (app/(root)) passes 'en'. Two root layouts let <html lang>
// reflect the active locale while staying statically generated (no app/layout.tsx).
export default function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        {children}
        <DynamicManifest />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  )
}
