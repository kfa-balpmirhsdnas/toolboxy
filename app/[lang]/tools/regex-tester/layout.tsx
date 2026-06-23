import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('regex-tester', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
