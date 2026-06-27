import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('base64-decoder', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
