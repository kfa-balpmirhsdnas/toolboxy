'use client'

import AntonymLookup from '@/components/tools/AntonymLookup'

export default function Page({ params }: { params: { lang: string } }) {
  return <AntonymLookup slug="japanese-antonyms" lang="ja" pageLang={params.lang} />
}
