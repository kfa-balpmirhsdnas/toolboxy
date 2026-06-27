'use client'

import WordTranslator from '@/components/tools/WordTranslator'

export default function Page({ params }: { params: { lang: string } }) {
  return <WordTranslator slug="english-to-korean" from="en" to="ko" lang={params.lang} />
}
