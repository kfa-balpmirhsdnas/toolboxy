'use client'

import WordTranslator from '@/components/tools/WordTranslator'

export default function Page({ params }: { params: { lang: string } }) {
  return <WordTranslator slug="japanese-to-korean" from="ja" to="ko" lang={params.lang} />
}
