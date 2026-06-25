'use client'

import SutraViewer from '@/components/tools/SutraViewer'
import { getToolBySlug } from '@/lib/tools/registry'
import { BANYASIMGYEONG } from '@/lib/scriptures/banyasimgyeong'

const tool = getToolBySlug('banyasimgyeong')!

export default function BanyasimgyeongPage({ params }: { params: { lang: string } }) {
  return <SutraViewer lines={BANYASIMGYEONG} tool={tool} lang={params.lang} />
}
