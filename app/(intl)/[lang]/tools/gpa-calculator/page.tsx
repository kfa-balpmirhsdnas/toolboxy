'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

// Per-scale grade tables. 4.5/4.3 are the Korean university standards (A0-style grades);
// 4.0 is the US letter scale; 5.0/10.0/100 derive linearly from the 4.0 points (as before).
type Scale = '4.5' | '4.3' | '4.0' | '5.0' | '10.0' | '100'
const US_GRADES: [string, number][] = [['A+', 4.0], ['A', 4.0], ['A-', 3.7], ['B+', 3.3], ['B', 3.0], ['B-', 2.7], ['C+', 2.3], ['C', 2.0], ['C-', 1.7], ['D+', 1.3], ['D', 1.0], ['D-', 0.7], ['F', 0]]
const SCALES: Record<Scale, { max: number; grades: [string, number][] }> = {
  '4.5': { max: 4.5, grades: [['A+', 4.5], ['A0', 4.0], ['B+', 3.5], ['B0', 3.0], ['C+', 2.5], ['C0', 2.0], ['D+', 1.5], ['D0', 1.0], ['F', 0]] },
  '4.3': { max: 4.3, grades: [['A+', 4.3], ['A0', 4.0], ['A-', 3.7], ['B+', 3.3], ['B0', 3.0], ['B-', 2.7], ['C+', 2.3], ['C0', 2.0], ['C-', 1.7], ['D+', 1.3], ['D0', 1.0], ['D-', 0.7], ['F', 0]] },
  '4.0': { max: 4.0, grades: US_GRADES },
  '5.0': { max: 5.0, grades: US_GRADES.map(([g, p]) => [g, +(p / 4 * 5).toFixed(2)]) },
  '10.0': { max: 10.0, grades: US_GRADES.map(([g, p]) => [g, +(p / 4 * 10).toFixed(2)]) },
  '100': { max: 100, grades: US_GRADES.map(([g, p]) => [g, +(p / 4 * 100).toFixed(1)]) },
}
// Object.keys puts integer-like keys ('100') first — keep an explicit display order.
const SCALE_ORDER: Scale[] = ['4.5', '4.3', '4.0', '5.0', '10.0', '100']
const gradeMap = (s: Scale) => Object.fromEntries(SCALES[s].grades) as Record<string, number>
// When the scale changes, coerce grades into the new set (A ↔ A0 style swap, else nearest label).
function coerce(g: string, s: Scale): string {
  const m = gradeMap(s)
  if (g in m) return g
  const swap = g.endsWith('0') ? g.slice(0, -1) : g.replace(/^([A-D])$/, '$10')
  if (swap in m) return swap
  const zero = g.replace('-', '0').replace('+', '+')
  if (zero in m) return zero
  return SCALES[s].grades[0][0]
}

type Course = { id: number; name: string; grade: string; credits: string; major: boolean }

function gpaColor(gpa: number, max: number): string {
  const pct = gpa / max
  if (pct >= 0.85) return 'text-green-600'
  if (pct >= 0.7) return 'text-blue-600'
  if (pct >= 0.6) return 'text-yellow-600'
  return 'text-red-500'
}

const tool = getToolBySlug('gpa-calculator')!

export default function GpaCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  // Korean pages default to the 4.5 scale (the domestic standard); ja/en default to 4.0.
  const [scale, setScale] = useState<Scale>(params.lang === 'ko' ? '4.5' : '4.0')
  const [courses, setCourses] = useState<Course[]>(() => [
    { id: 1, name: t('gp_d_math'), grade: 'A0', credits: '3', major: true },
    { id: 2, name: t('gp_d_eng'), grade: 'B+', credits: '3', major: false },
    { id: 3, name: t('gp_d_phys'), grade: 'A+', credits: '4', major: true },
  ])
  const [nextId, setNextId] = useState(4)

  function add() { setCourses(c => [...c, { id: nextId, name: '', grade: SCALES[scale].grades[0][0], credits: '3', major: false }]); setNextId(n => n + 1) }
  function remove(id: number) { setCourses(c => c.filter(x => x.id !== id)) }
  function update(id: number, f: 'name' | 'grade' | 'credits', v: string) { setCourses(c => c.map(x => x.id === id ? { ...x, [f]: v } : x)) }
  function toggleMajor(id: number) { setCourses(c => c.map(x => x.id === id ? { ...x, major: !x.major } : x)) }
  function switchScale(s: Scale) { setScale(s); setCourses(c => c.map(x => ({ ...x, grade: coerce(x.grade, s) }))) }

  const m = gradeMap(scale)
  const calc = (list: Course[]) => {
    const credits = list.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0)
    const points = list.reduce((s, c) => s + (m[coerce(c.grade, scale)] ?? 0) * (parseFloat(c.credits) || 0), 0)
    return { credits, gpa: credits > 0 ? points / credits : 0 }
  }
  const all = calc(courses)
  const majors = calc(courses.filter(c => c.major))
  const max = SCALES[scale].max
  // Cross-scale views + percentile: simple proportional conversion (통용 단순 비례식) — clearly disclaimed.
  const conv = (to: Scale) => (all.gpa / max * SCALES[to].max)
  const OTHER_SCALES = (['4.5', '4.3', '4.0'] as Scale[]).filter((s) => s !== scale)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('gp_title')}</h1>
        <p className="text-gray-500 mb-8">{t('gp_subtitle')}</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 self-center">{t('gp_scale')}</span>
          {SCALE_ORDER.map(s => (
            <button key={s} onClick={() => switchScale(s)} className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (scale === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-700')}>{s}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs font-medium text-gray-500 px-1">
            <span>{t('gp_course')}</span><span>{t('gp_grade')}</span><span>{t('gp_credits')}</span><span>{t('gp_major')}</span><span />
          </div>
          {courses.map(c => (
            <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
              <input value={c.name} onChange={e => update(c.id, 'name', e.target.value)} placeholder={t('gp_course_ph')}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0" />
              <select value={coerce(c.grade, scale)} onChange={e => update(c.id, 'grade', e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                {SCALES[scale].grades.map(([g]) => <option key={g} value={g}>{g}</option>)}
              </select>
              <input type="number" value={c.credits} onChange={e => update(c.id, 'credits', e.target.value)} min={1} max={6}
                className="w-14 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
              <button onClick={() => toggleMajor(c.id)} aria-label={t('gp_major')} title={t('gp_major')}
                className={'w-8 h-8 rounded-lg text-xs font-bold transition-colors ' + (c.major ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}>{t('gp_major_short')}</button>
              <button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-500">×</button>
            </div>
          ))}
          <button onClick={add} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{t('gp_add')}</button>
        </div>
        {all.credits > 0 && (
          <>
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">{t('gp_cumulative')} ({scale} {t('gp_scale_word')})</p>
                <p className={'text-5xl font-black ' + gpaColor(all.gpa, max)}>{all.gpa.toFixed(2)}</p>
              </div>
              {majors.credits > 0 && (
                <div>
                  <p className="text-sm text-gray-500">{t('gp_major_gpa')}</p>
                  <p className={'text-3xl font-black ' + gpaColor(majors.gpa, max)}>{majors.gpa.toFixed(2)}</p>
                </div>
              )}
              <div className="text-right text-sm text-gray-500">
                <p>{t('gp_total_credits')} <strong>{all.credits}</strong></p>
                <p>{t('gp_courses')} <strong>{courses.length}</strong></p>
              </div>
            </div>
            {/* cross-scale views + percentile (simple proportional — schools differ) */}
            <div className="mt-3 rounded-2xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('gp_conv')}</p>
              <div className="flex flex-wrap gap-2">
                {OTHER_SCALES.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-700 tabular-nums">{s} {t('gp_scale_word')} <b>{conv(s).toFixed(2)}</b></span>
                ))}
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-100 text-sm text-brand-700 tabular-nums">{t('gp_pct')} <b>{(all.gpa / max * 100).toFixed(1)}</b></span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">{t('gp_disclaim')}</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
