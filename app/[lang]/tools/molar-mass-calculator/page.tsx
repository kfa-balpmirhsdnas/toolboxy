'use client'

import MolarMass from '@/components/tools/MolarMass'

export default function Page({ params }: { params: { lang: string } }) {
  return <MolarMass params={params} />
}
