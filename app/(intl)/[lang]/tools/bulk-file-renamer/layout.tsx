import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('bulk-file-renamer', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
