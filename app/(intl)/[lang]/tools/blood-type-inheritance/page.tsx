'use client'

import BloodType from '@/components/tools/BloodType'

export default function Page({ params }: { params: { lang: string } }) {
  return <BloodType params={params} />
}
