'use client'

import OhmsLaw from '@/components/tools/OhmsLaw'

export default function Page({ params }: { params: { lang: string } }) {
  return <OhmsLaw params={params} />
}
