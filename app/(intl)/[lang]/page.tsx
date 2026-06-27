import type { Metadata } from 'next'
import HomeSections from '@/components/home/HomeSections'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko']

// Self-referencing canonical + hreflang for each locale home, so /en /ja /ko are
// not flagged as "duplicate without user-selected canonical" in Search Console.
export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = LANGS.includes(params.lang) ? params.lang : 'en'
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}`
  languages['x-default'] = `${BASE}/en`
  return { alternates: { canonical: `${BASE}/${lang}`, languages } }
}

export default function Page({ params }: { params: { lang: string } }) {
  return <HomeSections params={params} />
}
