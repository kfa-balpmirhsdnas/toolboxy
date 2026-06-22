import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password Generator – Strong Random Passwords | ToolBoxy',
  description: 'Generate secure random passwords with custom length and character sets. Uses crypto.getRandomValues() for true randomness.',
  openGraph: {
    title: 'Password Generator – Strong Random Passwords | ToolBoxy',
    description: 'Generate secure random passwords with custom length and character sets. Uses crypto.getRandomValues() for true randomness.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Password Generator – Strong Random Passwords | ToolBoxy', description: 'Generate secure random passwords with custom length and character sets. Uses crypto.getRandomValues() for true randomness.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}