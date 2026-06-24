'use client'

import ElementaryEnTrainer from '@/components/tools/ElementaryEnTrainer'

export default function Page({ params }: { params: { lang: string } }) {
  return <ElementaryEnTrainer params={params} />
}
