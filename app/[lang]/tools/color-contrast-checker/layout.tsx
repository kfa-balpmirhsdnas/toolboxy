import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('color-contrast-checker', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
