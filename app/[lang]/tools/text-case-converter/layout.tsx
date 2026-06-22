import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text Case Converter – UPPERCASE, camelCase & more | ToolBoxy',
  description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case and more. Instant & free.',
  openGraph: {
    title: 'Text Case Converter – UPPERCASE, camelCase & more | ToolBoxy',
    description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case and more. Instant & free.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Text Case Converter – UPPERCASE, camelCase & more | ToolBoxy', description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case and more. Instant & free.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}