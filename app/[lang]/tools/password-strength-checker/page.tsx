'use client'
import { useState } from 'react'

interface Check { label: string; pass: boolean }

function analyzePassword(pwd: string) {
  const checks: Check[] = [
    { label: 'At least 8 characters', pass: pwd.length >= 8 },
    { label: 'At least 12 characters', pass: pwd.length >= 12 },
    { label: 'Uppercase letters (A-Z)', pass: /[A-Z]/.test(pwd) },
    { label: 'Lowercase letters (a-z)', pass: /[a-z]/.test(pwd) },
    { label: 'Numbers (0-9)', pass: /[0-9]/.test(pwd) },
    { label: 'Special characters (!@#...)', pass: /[^A-Za-z0-9]/.test(pwd) },
    { label: 'No common patterns', pass: !/^(password|123456|qwerty|abc123)/i.test(pwd) },
  ]
  const score = checks.filter(c => c.pass).length
  const strength = score <= 2 ? 'Very Weak' : score <= 3 ? 'Weak' : score <= 4 ? 'Fair' : score <= 5 ? 'Strong' : 'Very Strong'
  const color = score <= 2 ? 'bg-red-500' : score <= 3 ? 'bg-orange-500' : score <= 4 ? 'bg-yellow-500' : score <= 5 ? 'bg-blue-500' : 'bg-green-500'
  const textColor = score <= 2 ? 'text-red-600' : score <= 3 ? 'text-orange-600' : score <= 4 ? 'text-yellow-600' : score <= 5 ? 'text-blue-600' : 'text-green-600'
  
  // Entropy estimate
  let charSpace = 0
  if (/[a-z]/.test(pwd)) charSpace += 26
  if (/[A-Z]/.test(pwd)) charSpace += 26
  if (/[0-9]/.test(pwd)) charSpace += 10
  if (/[^A-Za-z0-9]/.test(pwd)) charSpace += 32
  const entropy = charSpace > 0 && pwd.length > 0 ? Math.floor(pwd.length * Math.log2(charSpace)) : 0

  return { checks, score, strength, color, textColor, entropy }
}

export default function PasswordStrengthCheckerPage() {
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)

  const result = analyzePassword(pwd)

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Strength Checker</h1>
        <p className="text-gray-500 mb-8">Analyze your password strength and get actionable improvement tips.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password..."
                value={pwd}
                onChange={e => setPwd(e.target.value)}
              />
              <button onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {pwd && (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Strength</span>
                  <span className={`text-sm font-bold ${result.textColor}`}>{result.strength}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${result.color}`} style={{width: `${(result.score / 7) * 100}%`}} />
                </div>
              </div>

              <div className="flex gap-4 text-center">
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">{pwd.length}</div>
                  <div className="text-xs text-gray-500">Length</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">{result.entropy}</div>
                  <div className="text-xs text-gray-500">Entropy (bits)</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">{result.score}/7</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>

              <div className="space-y-2">
                {result.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={c.pass ? 'text-green-500' : 'text-gray-300'}>
                      {c.pass ? '✓' : '○'}
                    </span>
                    <span className={c.pass ? 'text-gray-700' : 'text-gray-400'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
