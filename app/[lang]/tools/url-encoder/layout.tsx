import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'URL Encoder & Decoder – Free Online Tool | ToolBoxy',
  description: 'Encode and decode URLs instantly using encodeURIComponent. Handles special characters and percent-encoding.',
  openGraph: {
    title: 'URL Encoder & Decoder – Free Online Tool | ToolBoxy',
    description: 'Encode and decode URLs instantly using encodeURIComponent. Handles special characters and percent-encoding.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'URL Encoder & Decoder – Free Online Tool | ToolBoxy', description: 'Encode and decode URLs instantly using encodeURIComponent. Handles special characters and percent-encoding.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}