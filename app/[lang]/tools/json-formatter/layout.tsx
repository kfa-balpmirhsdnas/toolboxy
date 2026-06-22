import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JSON Formatter & Beautifier – Free Online Tool | ToolBoxy',
  description: 'Format, beautify, and minify JSON instantly. Validate JSON syntax with clear error messages. Free & no signup.',
  openGraph: {
    title: 'JSON Formatter & Beautifier – Free Online Tool | ToolBoxy',
    description: 'Format, beautify, and minify JSON instantly. Validate JSON syntax with clear error messages. Free & no signup.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'JSON Formatter & Beautifier – Free Online Tool | ToolBoxy', description: 'Format, beautify, and minify JSON instantly. Validate JSON syntax with clear error messages. Free & no signup.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}