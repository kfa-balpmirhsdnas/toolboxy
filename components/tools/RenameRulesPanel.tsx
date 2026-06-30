'use client'

// Shared rename-rules UI (live preview + general/advanced rule toggles), used by both
// batch-image-rename and bulk-file-renamer. The rule logic lives in lib/batch-image/rename.ts.

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { buildNewName, todayYMD, type RenameRules } from '@/lib/batch-image/rename'

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

export default function RenameRulesPanel({ rules: r, onChange: up, sampleNames }: { rules: RenameRules; onChange: (patch: Partial<RenameRules>) => void; sampleNames: string[] }) {
  const t = useTranslations('toolui')
  const [showAdv, setShowAdv] = useState(false)
  const genOn = [r.affixOn, r.seqOn, r.frOn, r.extLowerOn].filter(Boolean).length
  const advOn = [r.wsOn, r.stripOn, r.caseOn, r.dateOn, r.truncOn].filter(Boolean).length
  const examplePreview = sampleNames.map((n, i) => buildNewName(n, i, r))

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
        <span className="font-medium text-amber-800">{t('brn_preview_label')} : </span>
        <span className="font-mono text-amber-900 break-all">{examplePreview.join('  ·  ')}</span>
      </div>

      {/* PC: general (left) + advanced (right) side by side. Mobile: stacked, advanced collapsible. */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 sm:flex-1">
          <p className="text-sm font-medium text-gray-700">{t('brn_box_general')}{genOn > 0 && <span className="ml-1.5 text-xs text-brand-600">{t('brn_n_on', { n: genOn })}</span>}</p>
          <div className="space-y-3">
            <Rule on={r.affixOn} onToggle={(v) => up({ affixOn: v })} label={t('brn_affix')}>
              <span>{t('brn_prefix')}</span>
              <input value={r.prefix} onChange={(e) => up({ prefix: e.target.value })} className={inp + ' w-14 sm:w-28'} />
              <span>{t('brn_suffix')}</span>
              <input value={r.suffix} onChange={(e) => up({ suffix: e.target.value })} className={inp + ' w-14 sm:w-28'} />
            </Rule>

            <Rule on={r.seqOn} onToggle={(v) => up({ seqOn: v })} label={t('brn_sequence')}>
              <span>{t('brn_start')}</span>
              <input type="number" value={r.seqStart} onChange={(e) => up({ seqStart: Number(e.target.value) })} className={inp + ' w-20'} />
              <span>{t('brn_digits')}</span>
              <input type="number" min={1} value={r.seqDigits} onChange={(e) => up({ seqDigits: Number(e.target.value) })} className={inp + ' w-16'} />
              <div className="w-full h-0" />
              <span>{t('brn_step')}</span>
              <input type="number" min={1} value={r.seqStep} onChange={(e) => up({ seqStep: Number(e.target.value) })} className={inp + ' w-16'} />
              <span>{t('brn_pos_label')}</span>
              <select value={r.seqPos} onChange={(e) => up({ seqPos: e.target.value as RenameRules['seqPos'] })} className={sel}>
                <option value="front">{t('brn_at_front')}</option>
                <option value="back">{t('brn_at_back')}</option>
              </select>
            </Rule>

            <Rule on={r.frOn} onToggle={(v) => up({ frOn: v })} label={t('brn_find_replace')}>
              <span>{t('brn_find')}</span>
              <input value={r.find} onChange={(e) => up({ find: e.target.value })} className={inp + ' w-14 sm:w-28'} />
              <span>{t('brn_replace')}</span>
              <input value={r.replace} onChange={(e) => up({ replace: e.target.value })} className={inp + ' w-14 sm:w-28'} />
            </Rule>

            <Rule on={r.extLowerOn} onToggle={(v) => up({ extLowerOn: v })} label={t('brn_ext_lower')}>
              <span className="text-xs text-gray-400">{t('brn_ext_desc')}</span>
            </Rule>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 sm:flex-1">
          <button onClick={() => setShowAdv((v) => !v)} className="w-full flex items-center justify-between text-sm font-medium text-gray-700 sm:cursor-default">
            <span>{t('brn_box_advanced')}{advOn > 0 && <span className="ml-1.5 text-xs text-brand-600">{t('brn_n_on', { n: advOn })}</span>}</span>
            <span className="text-gray-400 sm:hidden">{showAdv ? '▴' : '▾'}</span>
          </button>

          <div className={(showAdv ? 'block' : 'hidden') + ' sm:block space-y-3'}>
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
        </div>
      </div>
    </div>
  )
}
