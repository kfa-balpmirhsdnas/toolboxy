'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('study-planner')!
const LS_KEY = 'spl_data_v1'
const PALETTE = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6','#14b8a6']

type Subject = { id: number; name: string; color: string }
type Task = { id: number; subjectId: number; date: string; text: string; done: boolean }
type Data = { subjects: Subject[]; tasks: Task[] }

function ymd(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
// Monday-start week containing `anchor`.
function weekOf(anchor: Date): string[] {
  const dow = (anchor.getDay() + 6) % 7
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(anchor); x.setDate(anchor.getDate() - dow + i); return ymd(x)
  })
}

export default function StudyPlannerPage() {
  const t = useTranslations('toolui')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'week' | 'day'>('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [dayDate, setDayDate] = useState(() => ymd(new Date()))
  const [addingFor, setAddingFor] = useState<string | null>(null) // date being added to
  const [newTask, setNewTask] = useState('')
  const [newSubjId, setNewSubjId] = useState<number | null>(null)
  const [subjName, setSubjName] = useState('')
  const [subjColor, setSubjColor] = useState(PALETTE[0])
  const [managing, setManaging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const d = JSON.parse(raw) as Data
        if (d && Array.isArray(d.subjects) && Array.isArray(d.tasks)) { setSubjects(d.subjects); setTasks(d.tasks) }
      }
    } catch { /* corrupted — start fresh */ }
  }, [])

  function persist(s: Subject[], tk: Task[]) {
    setSubjects(s); setTasks(tk)
    try { localStorage.setItem(LS_KEY, JSON.stringify({ subjects: s, tasks: tk })) } catch { /* quota */ }
  }

  // ----- subjects -----
  function addSubject() {
    if (!subjName.trim()) return
    const sub: Subject = { id: Date.now(), name: subjName.trim(), color: subjColor }
    persist([...subjects, sub], tasks)
    setSubjName('')
    if (newSubjId === null) setNewSubjId(sub.id)
  }
  function removeSubject(id: number) {
    persist(subjects.filter(s => s.id !== id), tasks.filter(x => x.subjectId !== id))
    if (newSubjId === id) setNewSubjId(null)
  }
  const subjById = (id: number) => subjects.find(s => s.id === id)

  // ----- tasks -----
  function addTask(date: string) {
    if (!newTask.trim() || newSubjId === null) return
    persist(subjects, [...tasks, { id: Date.now(), subjectId: newSubjId, date, text: newTask.trim(), done: false }])
    setNewTask('')
  }
  function toggleTask(id: number) { persist(subjects, tasks.map(x => x.id === id ? { ...x, done: !x.done } : x)) }
  function removeTask(id: number) { persist(subjects, tasks.filter(x => x.id !== id)) }

  // ----- backup -----
  function exportJson() {
    const blob = new Blob([JSON.stringify({ subjects, tasks }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'study-planner.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function importJson(f: File) {
    f.text().then(txt => {
      try {
        const d = JSON.parse(txt) as Data
        if (!d || !Array.isArray(d.subjects) || !Array.isArray(d.tasks)) throw new Error()
        persist(d.subjects, d.tasks)
      } catch { alert(t('exd_import_err')) }
    })
  }

  const week = weekOf(anchor)
  const today = ymd(new Date())
  const dayNames = [t('ht_mon'), t('ht_tue'), t('ht_wed'), t('ht_thu'), t('ht_fri'), t('ht_sat'), t('ht_sun')]
  const tasksOn = (date: string) => tasks.filter(x => x.date === date)
  const rate = (list: Task[]) => list.length ? Math.round(list.filter(x => x.done).length / list.length * 100) : null
  const weekTasks = tasks.filter(x => week.includes(x.date))
  const weekRate = rate(weekTasks)

  // Print: A4 weekly table (days × tasks with checkboxes).
  function printWeek() {
    let cols = ''
    for (let i = 0; i < 7; i++) {
      const items = tasksOn(week[i]).map(x => {
        const s = subjById(x.subjectId)
        return `<li class="${x.done ? 'd' : ''}"><span class="dot" style="background:${s?.color ?? '#999'}"></span>${(s ? s.name + ' · ' : '')}${x.text.replace(/</g, '&lt;')}</li>`
      }).join('')
      cols += `<td><h2>${dayNames[i]} <small>${week[i].slice(5)}</small></h2><ul>${items}</ul></td>`
    }
    const w = window.open('', '_blank', 'width=1100,height=750')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>${t('spl_title')} ${week[0]} ~ ${week[6]}</title><style>
      @page{size:A4 landscape;margin:10mm} body{font-family:sans-serif;padding:8px}
      h1{font-size:15px;margin:0 0 8px} table{border-collapse:collapse;width:100%;table-layout:fixed}
      td{border:1px solid #bbb;vertical-align:top;padding:4px;height:150mm}
      h2{font-size:12px;margin:0 0 4px;border-bottom:1px solid #ddd;padding-bottom:2px} small{color:#888;font-weight:normal}
      ul{list-style:none;margin:0;padding:0} li{font-size:10px;margin:2px 0;display:flex;align-items:center;gap:3px}
      li.d{text-decoration:line-through;color:#999}
      .dot{display:inline-block;width:7px;height:7px;border-radius:50%;flex:none}
    </style></head><body><h1>${t('spl_title')} · ${week[0]} ~ ${week[6]}</h1><table><tr>${cols}</tr></table></body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  const outlineBtn = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors'

  function dayCard(date: string, idx: number, big: boolean) {
    const list = tasksOn(date)
    const r = rate(list)
    return (
      <div key={date} className={'bg-white rounded-2xl border p-3 ' + (date === today ? 'border-brand-300' : 'border-gray-200')}>
        <div className="flex items-center justify-between mb-2">
          <p className={'text-sm font-semibold ' + (date === today ? 'text-brand-600' : 'text-gray-700')}>
            {dayNames[idx]} <span className="text-xs text-gray-400 font-normal">{date.slice(5).replace('-', '/')}</span>
          </p>
          {r !== null && <span className={'text-xs font-bold ' + (r === 100 ? 'text-green-600' : 'text-gray-400')}>{r}%</span>}
        </div>
        <ul className="space-y-1.5">
          {list.map(x => {
            const s = subjById(x.subjectId)
            return (
              <li key={x.id} className="flex items-center gap-2 group">
                <button onClick={() => toggleTask(x.id)} aria-label={t('spl_toggle')}
                  className={'w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center text-[11px] text-white transition-colors ' + (x.done ? 'border-transparent' : 'border-gray-300 bg-white')}
                  style={x.done ? { background: s?.color ?? '#10b981' } : {}}>{x.done ? '✓' : ''}</button>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s?.color ?? '#999' }} />
                <span className={'text-sm flex-1 min-w-0 break-words ' + (x.done ? 'line-through text-gray-400' : 'text-gray-800')}>
                  {s && <span className="text-xs text-gray-400">{s.name} · </span>}{x.text}
                </span>
                <button onClick={() => removeTask(x.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0">×</button>
              </li>
            )
          })}
          {list.length === 0 && <li className="text-xs text-gray-300">{big ? t('spl_no_tasks') : '—'}</li>}
        </ul>
        {addingFor === date ? (
          <div className="mt-2 space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {subjects.map(s => (
                <button key={s.id} onClick={() => setNewSubjId(s.id)}
                  className={'px-2 py-1 rounded text-[11px] font-medium border transition-colors ' + (newSubjId === s.id ? 'text-white' : 'bg-white text-gray-600 border-gray-200')}
                  style={newSubjId === s.id ? { background: s.color, borderColor: s.color } : {}}>{s.name}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask(date)}
                placeholder={t('spl_task_ph')} autoFocus
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0" />
              <button onClick={() => addTask(date)} className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold">{t('exd_add')}</button>
              <button onClick={() => setAddingFor(null)} className="px-2 text-gray-400 hover:text-gray-600">×</button>
            </div>
            {subjects.length === 0 && <p className="text-[11px] text-amber-600">{t('spl_need_subject')}</p>}
          </div>
        ) : (
          <button onClick={() => { setAddingFor(date); setNewTask('') }}
            className="mt-2 text-xs text-gray-400 hover:text-brand-600">+ {t('spl_add_task')}</button>
        )}
      </div>
    )
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('spl_title')}</h1>
        <p className="text-gray-500 mb-6">{t('spl_subtitle')}</p>

        {/* subjects bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-500 mr-1">{t('spl_subjects')}</span>
            {subjects.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white" style={{ background: s.color }}>
                {s.name}
                {managing && <button onClick={() => removeSubject(s.id)} className="ml-0.5 opacity-80 hover:opacity-100">×</button>}
              </span>
            ))}
            <button onClick={() => setManaging(m => !m)} className="text-xs text-gray-400 hover:text-brand-600 px-1">{managing ? t('spl_done_manage') : t('spl_manage')}</button>
          </div>
          {managing && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <input value={subjName} onChange={e => setSubjName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject()}
                placeholder={t('spl_subject_ph')} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none w-36" />
              {PALETTE.map(c => (
                <button key={c} onClick={() => setSubjColor(c)} aria-label={c}
                  className={'w-6 h-6 rounded-full transition-transform ' + (subjColor === c ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : '')}
                  style={{ background: c }} />
              ))}
              <button onClick={addSubject} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold">{t('exd_add')}</button>
            </div>
          )}
        </div>

        {/* view + nav */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
            <button onClick={() => setView('week')} className={'px-3 py-1.5 font-medium ' + (view === 'week' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600')}>{t('spl_week')}</button>
            <button onClick={() => setView('day')} className={'px-3 py-1.5 font-medium ' + (view === 'day' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600')}>{t('spl_day')}</button>
          </div>
          {view === 'week' ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setAnchor(a => { const d = new Date(a); d.setDate(d.getDate() - 7); return d })} className={outlineBtn}>‹</button>
              <span className="text-sm font-semibold text-gray-700 tabular-nums">{week[0].slice(5)} ~ {week[6].slice(5)}</span>
              <button onClick={() => setAnchor(a => { const d = new Date(a); d.setDate(d.getDate() + 7); return d })} className={outlineBtn}>›</button>
              {weekRate !== null && <span className="text-xs text-gray-500">{t('spl_week_rate')} <strong className={weekRate === 100 ? 'text-green-600' : 'text-gray-800'}>{weekRate}%</strong></span>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setDayDate(d => { const x = new Date(d); x.setDate(x.getDate() - 1); return ymd(x) })} className={outlineBtn}>‹</button>
              <input type="date" value={dayDate} onChange={e => e.target.value && setDayDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              <button onClick={() => setDayDate(d => { const x = new Date(d); x.setDate(x.getDate() + 1); return ymd(x) })} className={outlineBtn}>›</button>
            </div>
          )}
        </div>

        {view === 'week' ? (
          <div className="grid gap-3 min-[700px]:grid-cols-2 min-[1000px]:grid-cols-4">
            {week.map((d, i) => dayCard(d, i, false))}
          </div>
        ) : (
          dayCard(dayDate, (new Date(dayDate + 'T00:00').getDay() + 6) % 7, true)
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={exportJson} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_export')}</button>
          <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_import')}</button>
          <button onClick={printWeek} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('spl_print')}</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
        <p className="mt-4 text-[11px] text-gray-400">{t('exd_local_note')}</p>
      </div>
    </ToolLayout>
  )
}
