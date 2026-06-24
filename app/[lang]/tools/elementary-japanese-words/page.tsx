'use client'

import ElementaryJaTrainer from '@/components/tools/ElementaryJaTrainer'

export default function Page({ params }: { params: { lang: string } }) {
  return <ElementaryJaTrainer params={params} />
}
