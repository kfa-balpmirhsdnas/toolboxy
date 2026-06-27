'use client'

import WordTranslator from '@/components/tools/WordTranslator'

export default function Page({ params }: { params: { lang: string } }) {
  return <WordTranslator slug="korean-to-english" from="ko" to="en" lang={params.lang} />
}
