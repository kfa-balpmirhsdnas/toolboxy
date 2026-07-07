import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('mp4-to-mp3', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
