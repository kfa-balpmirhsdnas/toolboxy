import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('password-generator-pro', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
