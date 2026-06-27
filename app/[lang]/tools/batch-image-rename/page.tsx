'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { buildNewName, todayYMD, DEFAULT_RULES, type RenameRules } from '@/lib/batch-image/rename'

const tool = getToolBySlug('batch-image-rename')!

function Rule({ on, onToggle, label, children }: { on: boolean; onToggle: (v: boolean) => void; label: string; children?: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
        <input type="checkbox" checked={on} onChange={(e) => onToggle(e.target.checked)} className="accent-brand-600" />
        {label}
      </label>
      {on && <div className="mt-2 pl-6 flex flex-wrap items-center gap-2 text-sm text-gray-600">{children}</div>}
    </div>
  )
}

const inp = 'px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
const sel = inp + ' bg-white'

export default function BatchImageRenamePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [renamed, setRenamed] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [r, setR] = useState<RenameRules>(DEFAULT_RULES)
  const [showAdv, setShowAdv] = useState(false)
  const up = (patch: Partial<RenameRules>) => setR((prev) => ({ ...prev, ...patch }))
  const advOn = [r.wsOn, r.stripOn, r.caseOn, r.extLowerOn, r.dateOn, r.truncOn].filter(Boolean).length

  const processFn = useCallback<ProcessFn>(
    async (file, index) => ({ blob: file, filename: buildNewName(file.name, index, r) }),
    [r],
  )
  const previewName = useCallback((file: File, index: number) => buildNewName(file.name, index, r), [r])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <Rule on={r.affixOn} onToggle={(v) => up({ affixOn: v })} label={t('brn_affix')}>
            <span>{t('brn_prefix')}</span>
            <input value={r.prefix} onChange={(e) => up({ prefix: e.target.value })} className={inp + ' w-32'} />
            <span>{t('brn_suffix')}</span>
            <input value={r.suffix} onChange={(e) => up({ suffix: e.target.value })} className={inp + ' w-32'} />
          </Rule>

          <Rule on={r.seqOn} onToggle={(v) => up({ seqOn: v })} label={t('brn_sequence')}>
            <span>{t('brn_start')}</span>
            <input type="number" value={r.seqStart} onChange={(e) => up({ seqStart: Number(e.target.value) })} className={inp + ' w-20'} />
            <span>{t('brn_digits')}</span>
            <input type="number" min={1} value={r.seqDigits} onChange={(e) => up({ seqDigits: Number(e.target.value) })} className={inp + ' w-16'} />
            <span>{t('brn_step')}</span>
            <input type="number" min={1} value={r.seqStep} onChange={(e) => up({ seqStep: Number(e.target.value) })} className={inp + ' w-16'} />
            <select value={r.seqPos} onChange={(e) => up({ seqPos: e.target.value as RenameRules['seqPos'] })} className={sel}>
              <option value="front">{t('brn_at_front')}</option>
              <option value="back">{t('brn_at_back')}</option>
            </select>
          </Rule>

          <Rule on={r.frOn} onToggle={(v) => up({ frOn: v })} label={t('brn_find_replace')}>
            <span>{t('brn_find')}</span>
            <input value={r.find} onChange={(e) => up({ find: e.target.value })} className={inp + ' w-32'} />
            <span>{t('brn_replace')}</span>
            <input value={r.replace} onChange={(e) => up({ replace: e.target.value })} className={inp + ' w-32'} />
          </Rule>

          <button onClick={() => setShowAdv((v) => !v)}
            className="w-full flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <span>{t('brn_advanced')}{advOn > 0 && <span className="ml-1.5 text-xs text-brand-600">{t('brn_n_on', { n: advOn })}</span>}</span>
            <span className="text-gray-400">{showAdv ? '▴' : '▾'}</span>
          </button>

          {showAdv && (
            <div className="space-y-3">
              <Rule on={r.wsOn} onToggle={(v) => up({ wsOn: v })} label={t('brn_spaces')}>
                <select value={r.wsMode} onChange={(e) => up({ wsMode: e.target.value as RenameRules['wsMode'] })} className={sel}>
                  <option value="underscore">{t('brn_to_underscore')}</option>
                  <option value="hyphen">{t('brn_to_hyphen')}</option>
                  <option value="remove">{t('brn_remove')}</option>
                </select>
              </Rule>

              <Rule on={r.stripOn} onToggle={(v) => up({ stripOn: v })} label={t('brn_strip')}>
                <span className="text-xs text-gray-400">{t('brn_strip_hint')}</span>
              </Rule>

              <Rule on={r.caseOn} onToggle={(v) => up({ caseOn: v })} label={t('brn_case')}>
                <select value={r.caseMode} onChange={(e) => up({ caseMode: e.target.value as RenameRules['caseMode'] })} className={sel}>
                  <option value="lower">{t('brn_lower')}</option>
                  <option value="upper">{t('brn_upper')}</option>
                  <option value="capitalize">{t('brn_capitalize')}</option>
                </select>
              </Rule>

              <Rule on={r.extLowerOn} onToggle={(v) => up({ extLowerOn: v })} label={t('brn_ext_lower')} />

              <Rule on={r.dateOn} onToggle={(v) => up({ dateOn: v })} label={t('brn_date')}>
                <input value={r.dateValue} onChange={(e) => up({ dateValue: e.target.value })} placeholder={todayYMD()} className={inp + ' w-32'} />
                <select value={r.datePos} onChange={(e) => up({ datePos: e.target.value as RenameRules['datePos'] })} className={sel}>
                  <option value="front">{t('brn_at_front')}</option>
                  <option value="back">{t('brn_at_back')}</option>
                </select>
              </Rule>

              <Rule on={r.truncOn} onToggle={(v) => up({ truncOn: v })} label={t('brn_truncate')}>
                <span>{t('brn_keep')}</span>
                <select value={r.truncMode} onChange={(e) => up({ truncMode: e.target.value as RenameRules['truncMode'] })} className={sel}>
                  <option value="first">{t('brn_first')}</option>
                  <option value="last">{t('brn_last')}</option>
                </select>
                <input type="number" min={1} value={r.truncN} onChange={(e) => up({ truncN: Number(e.target.value) })} className={inp + ' w-16'} />
                <span>{t('brn_chars')}</span>
              </Rule>
            </div>
          )}
        </div>

        <BatchImageProcessor slug="batch-image-rename" processFn={processFn} previewName={previewName} zipBaseName="renamed" ctaLabel={t('brn_cta')} initialFiles={seed} onComplete={setRenamed} />
        <BatchToolNav current="batch-image-rename" lang={params.lang} results={renamed} />
      </div>
    </ToolLayout>
  )
}
