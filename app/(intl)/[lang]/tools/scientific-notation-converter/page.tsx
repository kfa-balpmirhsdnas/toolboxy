'use client'

import ScientificNotation from '@/components/tools/ScientificNotation'

export default function Page({ params }: { params: { lang: string } }) {
  return <ScientificNotation params={params} />
}
