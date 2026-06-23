import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('json-diff', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
