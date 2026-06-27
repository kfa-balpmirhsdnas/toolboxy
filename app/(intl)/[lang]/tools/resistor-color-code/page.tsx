'use client'

import ResistorColorCode from '@/components/tools/ResistorColorCode'

export default function Page({ params }: { params: { lang: string } }) {
  return <ResistorColorCode params={params} />
}
