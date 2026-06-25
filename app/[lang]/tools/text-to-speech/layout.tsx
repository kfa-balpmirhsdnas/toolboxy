import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('text-to-speech', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
