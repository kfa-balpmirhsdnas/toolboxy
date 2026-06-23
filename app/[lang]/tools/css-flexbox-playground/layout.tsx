import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('css-flexbox-playground', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
