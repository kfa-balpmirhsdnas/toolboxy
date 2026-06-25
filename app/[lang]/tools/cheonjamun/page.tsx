'use client'

import ClassicsLearner from '@/components/tools/ClassicsLearner'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONJAMUN } from '@/lib/classics/cheonjamun'

const tool = getToolBySlug('cheonjamun')!

export default function Page({ params }: { params: { lang: string } }) {
  return <ClassicsLearner verses={CHEONJAMUN} tool={tool} lang={params.lang} slug="cheonjamun" tkey="cj" />
}
