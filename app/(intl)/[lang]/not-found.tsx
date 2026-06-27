import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-8xl mb-6 select-none">🧰</div>
        <h1 className="text-7xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8">The tool or page you're looking for doesn't exist or may have been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/en" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">← Back to Home</Link>
          <Link href="/en/tools" className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Browse Tools</Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">Looking for a specific tool? Try the <Link href="/en/tools" className="text-brand-600 hover:underline">tools page</Link>.</p>
      </div>
    </div>
  )
}
