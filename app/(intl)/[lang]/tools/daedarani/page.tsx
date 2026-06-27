'use client'

import { useTranslations } from 'next-intl'
import SutraViewer from '@/components/tools/SutraViewer'
import { getToolBySlug } from '@/lib/tools/registry'
import { DAEDARANI } from '@/lib/scriptures/daedarani'

const tool = getToolBySlug('daedarani')!

export default function DaedaraniPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  return <SutraViewer lines={DAEDARANI} tool={tool} lang={params.lang} intro={t('dd_intro')} reciteCounter />
}
