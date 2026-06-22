'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('habit-tracker')!

interface Habit { id: string; name: string; emoji: string; completedDays: string[] }

const EMOJIS = ['💧','🏃','📚','🧘','🥗','💊','✍️','🎸','🌿','😴']
const DAYS_SHOWN = 7

function getTodayStr(): string {
  const d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')
}
function getDateStr(offset:number): string {
  const d = new Date(); d.setDate(d.getDate()-offset)
  return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')
}
function getDayLabel(offset:number): string {
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const d = new Date(); d.setDate(d.getDate()-offset)
  return offset===0?'Today':offset===1?'Yesterday':days[d.getDay()]
}

const DEFAULT_HABITS: Habit[] = [
  { id:'1', name:'Drink water', emoji:'💧', completedDays:[getTodayStr()] },
  { id:'2', name:'Exercise',    emoji:'🏃', completedDays:[] },
  { id:'3', name:'Read',        emoji:'📚', completedDays:[] },
]

export default function HabitTrackerPage({ params }: { params: { lang: string } }) {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('💧')
  const [adding, setAdding] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('habit-tracker'); tracked.current = true } }

  function toggle(habitId: string, dayStr: string) {
    track()
    setHabits(prev=>prev.map(h=>{
      if (h.id!==habitId) return h
      const has = h.completedDays.includes(dayStr)
      return {...h, completedDays:has?h.completedDays.filter(d=>d!==dayStr):[...h.completedDays,dayStr]}
    }))
  }

  function addHabit() {
    if (!newName.trim()) return
    setHabits(prev=>[...prev,{id:Date.now().toString(),name:newName.trim(),emoji:newEmoji,completedDays:[]}])
    setNewName(''); setAdding(false); track()
  }

  function removeHabit(id: string) { setHabits(prev=>prev.filter(h=>h.id!==id)) }

  function getStreak(habit: Habit): number {
    let s=0, i=0
    while(habit.completedDays.includes(getDateStr(i))){s++;i++}
    return s
  }

  const dates = Array.from({length:DAYS_SHOWN},(_,i)=>({str:getDateStr(i),label:getDayLabel(i)}))
  const today = getTodayStr()
  const todayCompleted = habits.filter(h=>h.completedDays.includes(today)).length
  const completionRate = habits.length ? Math.round(todayCompleted/habits.length*100) : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Today: {todayCompleted}/{habits.length} completed</p>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1"><div className="h-1.5 bg-brand-500 rounded-full transition-all" style={{width:completionRate+'%'}} /></div>
          </div>
          <button onClick={()=>setAdding(!adding)} className="px-3 py-1.5 rounded-xl text-xs bg-brand-600 text-white hover:bg-brand-700 transition-colors">
            + Add Habit
          </button>
        </div>
        {adding && (
          <div className="p-3 border border-brand-200 bg-brand-50 rounded-xl space-y-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Habit name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setNewEmoji(e)}
                  className={'text-lg w-8 h-8 rounded-lg transition-colors ' + (newEmoji===e?'bg-brand-100 border border-brand-300':'hover:bg-gray-100')}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addHabit} className="px-3 py-1.5 rounded-lg text-xs bg-brand-600 text-white">Add</button>
              <button onClick={()=>setAdding(false)} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600">Cancel</button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4 w-32">Habit</th>
                {dates.map(d=>(
                  <th key={d.str} className={'text-center text-xs font-medium pb-2 w-10 ' + (d.str===today?'text-brand-600':'text-gray-400')}>
                    {d.label}
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-gray-400 pb-2 w-12">Streak</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {habits.map(h=>(
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
                        className={'w-7 h-7 rounded-full text-base transition-all ' + (h.completedDays.includes(d.str)?'bg-brand-500 hover:bg-brand-600':'bg-gray-100 hover:bg-gray-200')}>
                        {h.completedDays.includes(d.str)?'✓':''}
                      </button>
                    </td>
                  ))}
                  <td className="text-center py-2">
                    <span className={'text-xs font-bold ' + (getStreak(h)>0?'text-orange-500':'text-gray-300')}>
                      {getStreak(h)>0?'🔥'+getStreak(h):'—'}
                    </span>
                  </td>
                  <td className="py-2 pl-1">
                    <button onClick={()=>removeHabit(h.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}
