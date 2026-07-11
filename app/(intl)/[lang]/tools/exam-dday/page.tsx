'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('exam-dday')!
const LS_KEY = 'exd_exams_v1'

type Exam = { id: number; name: string; date: string } // date = YYYY-MM-DD

// Name-only presets per locale (dates are never hardcoded — exam dates change yearly).
const PRESETS: Record<string, string[]> = {
  ko: ['수능', '토익', '한국사능력검정', '공무원 시험'],
  ja: ['JLPT 7月', 'JLPT 12月', 'TOEIC', '英検'],
  en: ['TOEFL', 'IELTS', 'SAT', 'Final Exam'],
}

const DAY = 86400000
function today0(): number { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
function parseDate(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3]).getTime()
}
// Days from today (0 = today, positive = future). Weekend days counted from
// tomorrow through the exam date inclusive.
function stats(dateStr: string) {
  const target = parseDate(dateStr)
  if (target === null) return null
  const days = Math.round((target - today0()) / DAY)
  let weekends = 0
  for (let i = 1; i <= Math.min(days, 3700); i++) {
    const dow = new Date(today0() + i * DAY).getDay()
    if (dow === 0 || dow === 6) weekends++
  }
  return { days, weekends, hours: Math.max(0, days) * 3 }
}

export default function ExamDdayPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}

  const [exams, setExams] = useState<Exam[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Load once on mount (read-only effect); all writes happen in handlers.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setExams(JSON.parse(raw))
    } catch { /* corrupted storage — start fresh */ }
  }, [])

  function persist(next: Exam[]) {
    setExams(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* quota */ }
  }

  function add() {
    if (!name.trim() || !parseDate(date)) { setErr(t('exd_err')); return }
    setErr('')
    persist([...exams, { id: Date.now(), name: name.trim(), date }])
    setName('')
  }
  function remove(id: number) { persist(exams.filter(e => e.id !== id)) }

  function exportJson() {
    const blob = new Blob([JSON.stringify(exams, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'exam-dday.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function importJson(f: File) {
    f.text().then(txt => {
      try {
        const arr = JSON.parse(txt)
        if (!Array.isArray(arr)) throw new Error()
        const clean: Exam[] = arr
          .filter((x) => x && typeof x.name === 'string' && typeof x.date === 'string' && parseDate(x.date) !== null)
          .map((x, i) => ({ id: Date.now() + i, name: x.name, date: x.date }))
        persist(clean)
        setErr('')
      } catch { setErr(t('exd_import_err')) }
    })
  }

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))
  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('exd_title')}</h1>
        <p className="text-gray-500 mb-8">{t('exd_subtitle')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(PRESETS[lang] ?? PRESETS.en).map(p => (
              <button key={p} onClick={() => setName(p)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">{p}</button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('exd_name_ph')} className={inputCls + ' min-w-0'} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            <button onClick={add} className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold">{t('exd_add')}</button>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <p className="text-xs text-gray-400">{t('exd_preset_note')}</p>
        </div>

        <div className="mt-4 space-y-3">
          {sorted.map(e => {
            const s = stats(e.date)!
            const past = s.days < 0
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{e.name}</p>
                  <p className="text-sm text-gray-500">{e.date}</p>
                  {!past && s.days > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('exd_weekends', { n: s.weekends })} · {t('exd_hours', { n: s.hours })}
                    </p>
                  )}
                </div>
                <p className={'text-3xl font-black shrink-0 ' + (past ? 'text-gray-400' : s.days <= 7 ? 'text-red-500' : s.days <= 30 ? 'text-yellow-600' : 'text-brand-600')}>
                  {s.days === 0 ? 'D-day' : s.days > 0 ? `D-${s.days}` : `D+${-s.days}`}
                </p>
                <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-red-500 shrink-0">×</button>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">{t('exd_empty')}</div>
          )}
        </div>

        {exams.length > 0 && (
          <div className="mt-3 flex gap-2">
            <button onClick={exportJson} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_export')}</button>
            <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_import')}</button>
          </div>
        )}
        {exams.length === 0 && (
          <div className="mt-3">
            <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_import')}</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />

        <p className="mt-4 text-[11px] text-gray-400">{t('exd_local_note')}</p>

        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('atd_related')}</span>
          <Link href={`/${lang}/tools/dday-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['dday-calculator'] || 'D-day Calculator'}</Link>
          <Link href={`/${lang}/tools/target-score-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['target-score-calculator'] || 'Target Score Calculator'}</Link>
          <Link href={`/${lang}/tools/pomodoro-timer`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['pomodoro-timer'] || 'Pomodoro Timer'}</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
