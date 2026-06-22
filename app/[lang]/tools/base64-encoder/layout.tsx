import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base64 Encoder – Free Online Base64 Encode Tool | ToolBoxy',
  description: 'Encode any text or data to Base64 instantly. Supports Unicode and UTF-8. Free online Base64 encoder.',
  openGraph: {
    title: 'Base64 Encoder – Free Online Base64 Encode Tool | ToolBoxy',
    description: 'Encode any text or data to Base64 instantly. Supports Unicode and UTF-8. Free online Base64 encoder.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Base64 Encoder – Free Online Base64 Encode Tool | ToolBoxy', description: 'Encode any text or data to Base64 instantly. Supports Unicode and UTF-8. Free online Base64 encoder.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}