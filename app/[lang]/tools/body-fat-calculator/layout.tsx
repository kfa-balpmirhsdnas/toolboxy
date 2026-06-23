import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('body-fat-calculator', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
