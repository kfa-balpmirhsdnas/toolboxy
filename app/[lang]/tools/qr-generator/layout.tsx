import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Generator – Free Online QR Maker | ToolBoxy',
  description: 'Generate QR codes for any URL or text. Download as PNG. Free, instant, no signup required.',
  openGraph: {
    title: 'QR Code Generator – Free Online QR Maker | ToolBoxy',
    description: 'Generate QR codes for any URL or text. Download as PNG. Free, instant, no signup required.',
    url: 'https://toolboxy.net',
    siteName: 'ToolBoxy',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'QR Code Generator – Free Online QR Maker | ToolBoxy', description: 'Generate QR codes for any URL or text. Download as PNG. Free, instant, no signup required.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}