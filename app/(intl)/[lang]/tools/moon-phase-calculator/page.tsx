'use client'

import MoonPhase from '@/components/tools/MoonPhase'

export default function Page({ params }: { params: { lang: string } }) {
  return <MoonPhase params={params} />
}
