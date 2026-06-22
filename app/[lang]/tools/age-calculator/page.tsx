'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('age-calculator')!

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('1990-01-01')
  const today = new Date()
  const birthDate = new Date(dob + 'T00:00:00')
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  let days = today.getDate() - birthDate.getDate()
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate() }
  if (months < 0) { years--; months += 12 }
  const diffMs = today.getTime() - birthDate.getTime()
  const totalDays = Math.max(0, Math.floor(diffMs / 86400000))
  const isValid = !isNaN(birthDate.getTime()) && birthDate < today

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            max={today.toISOString().slice(0, 10)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {isValid && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{years}</div>
                <div className="text-sm text-gray-500 mt-1">Years</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{months}</div>
                <div className="text-sm text-gray-500 mt-1">Months</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{days}</div>
                <div className="text-sm text-gray-500 mt-1">Days</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-gray-600">Total days lived: <span className="font-semibold">{totalDays.toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Total weeks: <span className="font-semibold">{Math.floor(totalDays / 7).toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Total hours: <span className="font-semibold">{(totalDays * 24).toLocaleString()}</span></p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}