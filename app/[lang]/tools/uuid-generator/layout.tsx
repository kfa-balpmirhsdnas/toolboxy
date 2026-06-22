import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UUID Generator – Free Online UUID v4 Generator | ToolBoxy',
  description: 'Generate UUID v4 identifiers instantly. Cryptographically secure using crypto.getRandomValues(). Bulk generation supported.',
  openGraph: {
    title: 'UUID Generator – Free Online UUID v4 Generator | ToolBoxy',
    description: 'Generate UUID v4 identifiers instantly. Cryptographically secure using crypto.getRandomValues(). Bulk generation supported.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'UUID Generator – Free Online UUID v4 Generator | ToolBoxy', description: 'Generate UUID v4 identifiers instantly. Cryptographically secure using crypto.getRandomValues(). Bulk generation supported.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}