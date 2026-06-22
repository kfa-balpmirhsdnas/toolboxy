'use client'
import { useState } from 'react'

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('')
  const [target, setTarget] = useState('')
  const [result, setResult] = useState<{
    years:number; months:number; days:number
    totalDays:number; totalHours:number; totalMinutes:number; nextBirthday:number
  }|null>(null)

  function calculate() {
    if (!dob) return
    const birth = new Date(dob)
    const to = target ? new Date(target) : new Date()
    if (birth >= to) { setResult(null); return }
    let years = to.getFullYear() - birth.getFullYear()
    let months = to.getMonth() - birth.getMonth()
    let days = to.getDate() - birth.getDate()
    if (days < 0) { months--; const pm = new Date(to.getFullYear(), to.getMonth(), 0); days += pm.getDate() }
    if (months < 0) { years--; months += 12 }
    const totalDays = Math.floor((to.getTime() - birth.getTime()) / 86400000)
    const nextBD = new Date(to.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBD <= to) nextBD.setFullYear(to.getFullYear() + 1)
    setResult({ years, months, days, totalDays, totalHours: totalDays*24, totalMinutes: totalDays*1440, nextBirthday: Math.ceil((nextBD.getTime()-to.getTime())/86400000) })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Age Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your exact age in years, months, days and more</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calculate Age As Of (leave blank for today)</label>
            <input type="date" value={target} onChange={e=>setTarget(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={calculate} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Calculate</button>
        </div>
        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
              <div className="text-6xl font-bold text-brand-600">{result.years}</div>
              <div className="text-xl text-gray-600 mt-1">years old</div>
              <div className="text-gray-500 mt-2">{result.months} months and {result.days} days</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([['Total Days', result.totalDays], ['Total Hours', result.totalHours], ['Total Minutes', result.totalMinutes]] as [string,number][]).map(([lbl,val]) => (
                <div key={lbl} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-gray-800">{val.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">{lbl}</div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-yellow-800 font-medium">
              Next birthday in <span className="font-bold text-yellow-600">{result.nextBirthday}</span> days
            </div>
          </div>
        )}
      </div>
    </main>
  )
}