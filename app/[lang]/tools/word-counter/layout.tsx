import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Word Counter – Free Online Word Count Tool | ToolBoxy',
  description: 'Count words, characters, sentences, and paragraphs instantly. Free real-time word counter — no signup required.',
  openGraph: {
    title: 'Word Counter – Free Online Word Count Tool | ToolBoxy',
    description: 'Count words, characters, sentences, and paragraphs instantly. Free real-time word counter — no signup required.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Word Counter – Free Online Word Count Tool | ToolBoxy', description: 'Count words, characters, sentences, and paragraphs instantly. Free real-time word counter — no signup required.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}