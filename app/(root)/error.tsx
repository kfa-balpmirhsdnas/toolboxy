'use client'
import { useEffect } from 'react'
import Link from 'next/link'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-8xl mb-6 select-none">⚠️</div>
        <h1 className="text-5xl font-black text-gray-900 mb-2">Oops!</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
        <p className="text-gray-500 mb-8">An unexpected error occurred. Please try again or return to the home page.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">Try Again</button>
          <Link href="/en" className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">← Back to Home</Link>
        </div>
        {process.env.NODE_ENV === 'development' && (<details className="mt-8 text-left bg-red-50 border border-red-100 rounded-xl p-4"><summary className="text-xs font-semibold text-red-600 cursor-pointer">Error details</summary><pre className="mt-2 text-xs text-red-500 whitespace-pre-wrap break-all">{error.message}</pre></details>)}
      </div>
    </div>
  )
}