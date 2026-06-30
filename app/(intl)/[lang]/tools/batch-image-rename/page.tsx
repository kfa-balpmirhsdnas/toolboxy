'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import RenameRulesPanel from '@/components/tools/RenameRulesPanel'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { buildNewName, DEFAULT_RULES, type RenameRules } from '@/lib/batch-image/rename'

const tool = getToolBySlug('batch-image-rename')!
// Sample filenames for the live preview — varied so every rule visibly changes it.
const SAMPLE_NAMES = ['Seoul여행.JPG', 'MyHolidayPhotos.png', 'vacation pic.jpeg']

export default function BatchImageRenamePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [renamed, setRenamed] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [r, setR] = useState<RenameRules>(DEFAULT_RULES)
  const up = useCallback((patch: Partial<RenameRules>) => setR((prev) => ({ ...prev, ...patch })), [])

  const processFn = useCallback<ProcessFn>(
    async (file, index) => ({ blob: file, filename: buildNewName(file.name, index, r) }),
    [r],
  )
  const previewName = useCallback((file: File, index: number) => buildNewName(file.name, index, r), [r])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <RenameRulesPanel rules={r} onChange={up} sampleNames={SAMPLE_NAMES} />
        <BatchImageProcessor slug="batch-image-rename" processFn={processFn} previewName={previewName} zipBaseName="renamed" ctaLabel={t('brn_cta')} initialFiles={seed} onComplete={setRenamed} />
        <BatchToolNav current="batch-image-rename" lang={params.lang} results={renamed} />
      </div>
    </ToolLayout>
  )
}
