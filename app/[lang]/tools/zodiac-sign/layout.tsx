import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('zodiac-sign', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
