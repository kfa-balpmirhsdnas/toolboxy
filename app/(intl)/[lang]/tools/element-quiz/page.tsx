'use client'

import ElementQuiz from '@/components/tools/ElementQuiz'

export default function Page({ params }: { params: { lang: string } }) {
  return <ElementQuiz params={params} />
}
