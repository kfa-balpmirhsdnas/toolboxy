'use client'

import PeriodicTable from '@/components/tools/PeriodicTable'

export default function Page({ params }: { params: { lang: string } }) {
  return <PeriodicTable params={params} />
}
