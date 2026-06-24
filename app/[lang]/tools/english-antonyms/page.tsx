'use client'

import AntonymLookup from '@/components/tools/AntonymLookup'

export default function Page({ params }: { params: { lang: string } }) {
  return <AntonymLookup slug="english-antonyms" lang="en" pageLang={params.lang} />
}
