'use client'

import SutraViewer from '@/components/tools/SutraViewer'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONSUGYEONG } from '@/lib/scriptures/cheonsugyeong'

const tool = getToolBySlug('cheonsugyeong')!

export default function CheonsugyeongPage({ params }: { params: { lang: string } }) {
  return <SutraViewer lines={CHEONSUGYEONG} tool={tool} lang={params.lang} />
}
