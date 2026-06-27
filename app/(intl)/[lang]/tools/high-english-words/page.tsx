'use client'

import ElementaryEnTrainer from '@/components/tools/ElementaryEnTrainer'
import { HIGH_WORDS } from '@/lib/high-words'

export default function Page({ params }: { params: { lang: string } }) {
  return <ElementaryEnTrainer params={params} slug="high-english-words" words={HIGH_WORDS} />
}
