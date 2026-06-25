import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('game-2048', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
