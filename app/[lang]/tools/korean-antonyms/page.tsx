'use client'

import AntonymLookup from '@/components/tools/AntonymLookup'

export default function Page({ params }: { params: { lang: string } }) {
  return <AntonymLookup slug="korean-antonyms" lang="ko" pageLang={params.lang} />
}
