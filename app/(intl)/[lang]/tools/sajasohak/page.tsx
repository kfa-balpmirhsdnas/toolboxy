'use client'

import ClassicsLearner from '@/components/tools/ClassicsLearner'
import { getToolBySlug } from '@/lib/tools/registry'
import { SAJASOHAK } from '@/lib/classics/sajasohak'

const tool = getToolBySlug('sajasohak')!

export default function Page({ params }: { params: { lang: string } }) {
  return <ClassicsLearner verses={SAJASOHAK} tool={tool} lang={params.lang} slug="sajasohak" tkey="sj" />
}
