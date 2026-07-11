'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('habit-tracker')!

interface Habit { id: string; name: string; emoji: string; color: string; weeklyGoal: number; completedDays: string[] }

const EMOJIS = ['💧','🏃','📚','🧘','🥗','💊','✍️','🎸','🌿','😴']
const PALETTE = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6','#14b8a6']
const DAYS_SHOWN = 7

function ymd(d: Date): string {
  return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')
}
function getTodayStr(): string { return ymd(new Date()) }
function getDateStr(offset:number): string {
  const d = new Date(); d.setDate(d.getDate()-offset); return ymd(d)
}
function getDayLabel(offset:number,t:(k:string)=>string): string {
  const days=[t('ht_sun'),t('ht_mon'),t('ht_tue'),t('ht_wed'),t('ht_thu'),t('ht_fri'),t('ht_sat')]
  const d = new Date(); d.setDate(d.getDate()-offset)
  return offset===0?t('ht_todaylabel'):offset===1?t('ht_yesterday'):days[d.getDay()]
}
// Monday-start week key for the weekly-goal progress.
function weekDates(): string[] {
  const d = new Date()
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  const out: string[] = []
  for (let i = 0; i < 7; i++) { const x = new Date(d); x.setDate(d.getDate() - dow + i); out.push(ymd(x)) }
  return out
}

const DEFAULT_HABITS: Habit[] = [
  { id:'1', name:'Drink water', emoji:'💧', color:PALETTE[0], weeklyGoal:7, completedDays:[getTodayStr()] },
  { id:'2', name:'Exercise',    emoji:'🏃', color:PALETTE[1], weeklyGoal:3, completedDays:[] },
  { id:'3', name:'Read',        emoji:'📚', color:PALETTE[2], weeklyGoal:5, completedDays:[] },
]

export default function HabitTrackerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('💧')
  const [newColor, setNewColor] = useState(PALETTE[0])
  const [newGoal, setNewGoal] = useState('0')
  const [adding, setAdding] = useState(false)
  const [view, setView] = useState<'week'|'month'>('week')
  const [monthCur, setMonthCur] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selHabit, setSelHabit] = useState<string>('')
  const tracked = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Habits persist in localStorage: read once on mount, write at every change (inside the
  // handlers, never a save-effect — see the StrictMode clobbering pitfall). First visit
  // (no stored key) keeps the demo defaults. Older records lack color/weeklyGoal → defaults.
  useEffect(() => {
    try {
      const s = localStorage.getItem('ht_habits_v1')
      if (s) {
        const p = JSON.parse(s)
        if (Array.isArray(p)) setHabits(p.map((h, i) => ({ color: PALETTE[i % PALETTE.length], weeklyGoal: 0, ...h })))
      }
    } catch { /* ignore */ }
  }, [])
  const persist = (updater: (prev: Habit[]) => Habit[]) => setHabits(prev => {
    const n = updater(prev)
    try { localStorage.setItem('ht_habits_v1', JSON.stringify(n)) } catch { /* ignore */ }
    return n
  })

  function track() { if (!tracked.current) { trackToolUsed('habit-tracker'); tracked.current = true } }

  function toggle(habitId: string, dayStr: string) {
    track()
    persist(prev=>prev.map(h=>{
      if (h.id!==habitId) return h
      const has = h.completedDays.includes(dayStr)
      return {...h, completedDays:has?h.completedDays.filter(d=>d!==dayStr):[...h.completedDays,dayStr]}
    }))
  }

  function addHabit() {
    if (!newName.trim()) return
    persist(prev=>[...prev,{id:Date.now().toString(),name:newName.trim(),emoji:newEmoji,color:newColor,weeklyGoal:Math.max(0,Math.min(7,parseInt(newGoal)||0)),completedDays:[]}])
    setNewName(''); setAdding(false); track()
  }

  function removeHabit(id: string) { persist(prev=>prev.filter(h=>h.id!==id)) }

  function getStreak(habit: Habit): number {
    let s=0, i=0
    while(habit.completedDays.includes(getDateStr(i))){s++;i++}
    return s
  }

  // ----- JSON backup -----
  function exportJson() {
    const blob = new Blob([JSON.stringify(habits, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'habit-tracker.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function importJson(f: File) {
    f.text().then(txt => {
      try {
        const arr = JSON.parse(txt)
        if (!Array.isArray(arr)) throw new Error()
        const clean: Habit[] = arr
          .filter(h => h && typeof h.name === 'string' && Array.isArray(h.completedDays))
          .map((h, i) => ({ id: Date.now() + '' + i, name: h.name, emoji: h.emoji || '💧', color: h.color || PALETTE[i % PALETTE.length], weeklyGoal: h.weeklyGoal || 0, completedDays: h.completedDays.filter((x: unknown) => typeof x === 'string') }))
        persist(() => clean)
      } catch { alert(t('exd_import_err')) }
    })
  }

  // ----- month helpers -----
  const daysInMonth = new Date(monthCur.y, monthCur.m + 1, 0).getDate()
  const firstDow = new Date(monthCur.y, monthCur.m, 1).getDay() // 0 = Sun
  const monthStr = (day: number) => monthCur.y + '-' + String(monthCur.m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
  const today = getTodayStr()
  const isCurMonth = today.startsWith(monthCur.y + '-' + String(monthCur.m + 1).padStart(2, '0'))
  const mHabit = habits.find(h => h.id === selHabit) ?? habits[0]
  const monthChecked = mHabit ? Array.from({ length: daysInMonth }, (_, i) => monthStr(i + 1)).filter(d => mHabit.completedDays.includes(d)).length : 0
  const monthDenom = isCurMonth ? new Date().getDate() : daysInMonth
  const monthRate = monthDenom > 0 ? Math.round(monthChecked / monthDenom * 100) : 0

  // Print view: a standalone month-grid table for every habit (opens the print dialog).
  function printMonth() {
    const title = `${monthCur.y}-${String(monthCur.m + 1).padStart(2, '0')}`
    let rows = ''
    for (const h of habits) {
      rows += `<tr><td class="n">${h.emoji} ${h.name.replace(/</g, '&lt;')}</td>` + Array.from({ length: daysInMonth }, (_, i) =>
        `<td>${h.completedDays.includes(monthStr(i + 1)) ? '✓' : ''}</td>`).join('') + '</tr>'
    }
    const head = Array.from({ length: daysInMonth }, (_, i) => `<th>${i + 1}</th>`).join('')
    const w = window.open('', '_blank', 'width=1000,height=700')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>${t('ht_title_print')} ${title}</title><style>
      body{font-family:sans-serif;padding:16px} h1{font-size:16px}
      table{border-collapse:collapse;width:100%} th,td{border:1px solid #ccc;font-size:10px;text-align:center;padding:2px}
      td.n{text-align:left;white-space:nowrap;padding:2px 6px;font-size:11px}
    </style></head><body><h1>${t('ht_title_print')} ${title}</h1><table><tr><th></th>${head}</tr>${rows}</table></body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  const dates = Array.from({length:DAYS_SHOWN},(_,i)=>({str:getDateStr(i),label:getDayLabel(i,t)}))
  const todayCompleted = habits.filter(h=>h.completedDays.includes(today)).length
  const completionRate = habits.length ? Math.round(todayCompleted/habits.length*100) : 0
  const wDates = weekDates()

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-700">{t('ht_today',{n:todayCompleted,m:habits.length})}</p>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1"><div className="h-1.5 bg-brand-500 rounded-full transition-all" style={{width:completionRate+'%'}} /></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              <button onClick={()=>setView('week')} className={'px-3 py-1.5 font-medium ' + (view==='week'?'bg-brand-500 text-white':'bg-white text-gray-600')}>{t('ht_week_view')}</button>
              <button onClick={()=>setView('month')} className={'px-3 py-1.5 font-medium ' + (view==='month'?'bg-brand-500 text-white':'bg-white text-gray-600')}>{t('ht_month_view')}</button>
            </div>
            <button onClick={()=>setAdding(!adding)} className="px-3 py-1.5 rounded-xl text-xs bg-brand-600 text-white hover:bg-brand-700 transition-colors">
              {t('ht_addhabit')}
            </button>
          </div>
        </div>
        {adding && (
          <div className="p-3 border border-brand-200 bg-brand-50 rounded-xl space-y-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder={t('ht_name_ph')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setNewEmoji(e)}
                  className={'text-lg w-8 h-8 rounded-lg transition-colors ' + (newEmoji===e?'bg-brand-100 border border-brand-300':'hover:bg-gray-100')}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {PALETTE.map(c=>(
                <button key={c} onClick={()=>setNewColor(c)} aria-label={c}
                  className={'w-7 h-7 rounded-full transition-transform ' + (newColor===c?'ring-2 ring-offset-1 ring-gray-500 scale-110':'')}
                  style={{background:c}} />
              ))}
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 ml-2">
                {t('ht_goal')}
                <input type="number" min={0} max={7} value={newGoal} onChange={e=>setNewGoal(e.target.value)}
                  className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center focus:outline-none" />
                <span className="text-gray-400">{t('ht_goal_unit')}</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={addHabit} className="px-3 py-1.5 rounded-lg text-xs bg-brand-600 text-white">{t('ht_add')}</button>
              <button onClick={()=>setAdding(false)} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600">{t('ht_cancel')}</button>
            </div>
          </div>
        )}

        {view==='week' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4 w-32">{t('ht_habit')}</th>
                {dates.map(d=>(
                  <th key={d.str} className={'text-center text-xs font-medium pb-2 w-10 ' + (d.str===today?'text-brand-600':'text-gray-400')}>
                    {d.label}
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-gray-400 pb-2 w-14">{t('ht_goal_col')}</th>
                <th className="text-center text-xs font-medium text-gray-400 pb-2 w-12">{t('ht_streak')}</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {habits.map(h=>{
                const weekDone = wDates.filter(d=>h.completedDays.includes(d)).length
                const goalMet = h.weeklyGoal>0 && weekDone>=h.weeklyGoal
                return (
                <tr key={h.id}>
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1.5">
                      <span>{h.emoji}</span>
                      <span className="text-xs font-medium text-gray-700 truncate max-w-20">{h.name}</span>
                    </span>
                  </td>
                  {dates.map(d=>(
                    <td key={d.str} className="text-center py-2">
                      <button onClick={()=>toggle(h.id,d.str)}
                        className={'w-7 h-7 rounded-full text-base text-white transition-all ' + (h.completedDays.includes(d.str)?'':'bg-gray-100 hover:bg-gray-200')}
                        style={h.completedDays.includes(d.str)?{background:h.color}:{}}>
                        {h.completedDays.includes(d.str)?'✓':''}
                      </button>
                    </td>
                  ))}
                  <td className="text-center py-2">
                    {h.weeklyGoal>0
                      ? <span className={'text-xs font-bold ' + (goalMet?'text-green-600':'text-gray-500')}>{weekDone}/{h.weeklyGoal}{goalMet?' ✓':''}</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="text-center py-2">
                    <span className={'text-xs font-bold ' + (getStreak(h)>0?'text-orange-500':'text-gray-300')}>
                      {getStreak(h)>0?'🔥'+getStreak(h):'—'}
                    </span>
                  </td>
                  <td className="py-2 pl-1">
                    <button onClick={()=>removeHabit(h.id)} className="text-gray-300 hover:text-red-400 text-xs inline-flex items-center justify-center" aria-label="remove"><ToolIcon name="x" className="w-4 h-4" /></button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        )}

        {view==='month' && mHabit && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {habits.map(h=>(
                <button key={h.id} onClick={()=>setSelHabit(h.id)}
                  className={'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' + (h.id===mHabit.id?'text-white':'bg-white text-gray-600 border-gray-200')}
                  style={h.id===mHabit.id?{background:h.color,borderColor:h.color}:{}}>
                  {h.emoji} {h.name}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={()=>setMonthCur(c=>({y:c.m===0?c.y-1:c.y,m:c.m===0?11:c.m-1}))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">‹</button>
              <p className="text-sm font-semibold text-gray-800">{monthCur.y}. {String(monthCur.m+1).padStart(2,'0')}</p>
              <button onClick={()=>setMonthCur(c=>({y:c.m===11?c.y+1:c.y,m:c.m===11?0:c.m+1}))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[t('ht_sun'),t('ht_mon'),t('ht_tue'),t('ht_wed'),t('ht_thu'),t('ht_fri'),t('ht_sat')].map((d,i)=>(
                <div key={i} className="text-center text-[11px] text-gray-400 font-medium">{d}</div>
              ))}
              {Array.from({length:firstDow}).map((_,i)=><div key={'e'+i} />)}
              {Array.from({length:daysInMonth},(_,i)=>{
                const ds = monthStr(i+1)
                const on = mHabit.completedDays.includes(ds)
                return (
                  <button key={ds} onClick={()=>toggle(mHabit.id,ds)}
                    className={'aspect-square rounded-lg text-sm font-medium transition-colors ' + (on?'text-white':'bg-gray-50 text-gray-600 hover:bg-gray-100') + (ds===today?' ring-2 ring-brand-400':'')}
                    style={on?{background:mHabit.color}:{}}>
                    {i+1}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 flex-wrap gap-2">
              <span>{t('ht_month_rate')} <strong className="text-gray-900">{monthRate}%</strong> <span className="text-gray-400">({monthChecked}/{monthDenom})</span></span>
              <span className={'text-xs font-bold ' + (getStreak(mHabit)>0?'text-orange-500':'text-gray-300')}>
                {getStreak(mHabit)>0?'🔥'+getStreak(mHabit):'—'}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={exportJson} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_export')}</button>
          <button onClick={()=>fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_import')}</button>
          <button onClick={printMonth} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('ht_print')}</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={e=>{const f=e.target.files?.[0]; if (f) importJson(f); e.target.value=''}} />
        <p className="text-[11px] text-gray-400">{t('exd_local_note')}</p>
      </div>
    </ToolLayout>
  )
}
