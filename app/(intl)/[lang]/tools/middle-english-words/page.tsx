'use client'

import ElementaryEnTrainer from '@/components/tools/ElementaryEnTrainer'
import { MIDDLE_WORDS } from '@/lib/middle-words'

export default function Page({ params }: { params: { lang: string } }) {
  return <ElementaryEnTrainer params={params} slug="middle-english-words" words={MIDDLE_WORDS} />
}
