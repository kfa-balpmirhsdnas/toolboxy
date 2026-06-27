'use client'

import PlanetAge from '@/components/tools/PlanetAge'

export default function Page({ params }: { params: { lang: string } }) {
  return <PlanetAge params={params} />
}
