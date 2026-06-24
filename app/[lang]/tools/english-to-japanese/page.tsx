'use client'

import WordTranslator from '@/components/tools/WordTranslator'

export default function Page({ params }: { params: { lang: string } }) {
  return <WordTranslator slug="english-to-japanese" from="en" to="ja" lang={params.lang} />
}
