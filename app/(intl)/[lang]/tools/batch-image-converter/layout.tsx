import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('batch-image-converter', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
