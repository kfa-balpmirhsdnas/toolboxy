'use client'

import PlanetWeight from '@/components/tools/PlanetWeight'

export default function Page({ params }: { params: { lang: string } }) {
  return <PlanetWeight params={params} />
}
