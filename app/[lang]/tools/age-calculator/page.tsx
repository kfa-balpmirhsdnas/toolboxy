'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('age-calculator')!

function calcAge(birth: Date, target: Date) {
  let years = target.getFullYear() - birth.getFullYear()
  let months = target.getMonth() - birth.getMonth()
  let days = target.getDate() - birth.getDate()
  if (days < 0) { months--; const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0); days += prevMonth.getDate() }
  if (months < 0) { years--; months += 12 }
  const totalDays = Math.floor((target.getTime()-birth.getTime())/86400000)
  const totalWeeks = Math.floor(totalDays/7)
  const totalMonths = years*12+months
  const totalHours = totalDays*24
  const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBday <= target) nextBday.setFullYear(nextBday.getFullYear()+1)
  const daysToNext = Math.ceil((nextBday.getTime()-target.getTime())/86400000)
  const isToday = birth.getMonth()===target.getMonth() && birth.getDate()===target.getDate()
  return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysToNext, isToday }
}

export default function AgeCalculatorPage({ params }: { params: { lang: string } }) {
  const today = new Date().toISOString().split('T')[0]
  const [birthDate, setBirthDate] = useState('1990-01-01')
  const [targetDate, setTargetDate] = useState(today)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('age-calculator'); tracked.current = true } }

  let result = null
  let error = ''
  try {
    const b = new Date(birthDate), t = new Date(targetDate)
    if (b > t) error = 'Birth date must be before target date'
    else result = calcAge(b, t)
  } catch { error = 'Invalid date' }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
            <input type="date" value={birthDate} max={today} onChange={e=>{setBirthDate(e.target.value);track()}}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">As of Date</label>
            <input type="date" value={targetDate} onChange={e=>{setTargetDate(e.target.value);track()}}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {result && (
          <div className="space-y-3">
            {result.isToday && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center text-sm font-semibold text-yellow-700">
                🎂 Happy Birthday!
              </div>
            )}
            <div className="p-5 bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 rounded-2xl text-center">
              <p className="text-5xl font-bold text-gray-800">{result.years}</p>
              <p className="text-sm text-gray-500 mt-1">years old</p>
              <p className="text-base font-semibold text-gray-700 mt-2">
                {result.months} months, {result.days} days
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:'Total days', value:result.totalDays.toLocaleString() },
                { label:'Total weeks', value:result.totalWeeks.toLocaleString() },
                { label:'Total months', value:result.totalMonths.toLocaleString() },
                { label:'Total hours', value:result.totalHours.toLocaleString() },
              ].map(row=>(
                <div key={row.label} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500">{row.label}</p>
                  <p className="text-base font-bold text-gray-800 font-mono">{row.value}</p>
                </div>
              ))}
            </div>
            {!result.isToday && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-center text-xs text-pink-700">
                🎂 Next birthday in <span className="font-bold">{result.daysToNext}</span> days
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
