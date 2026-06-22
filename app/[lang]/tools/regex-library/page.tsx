'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('regex-library')!

const PATTERNS = [
  { category:'Email & Web', name:'Email', pattern:'/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/', desc:'Validates email address format', example:'user@example.com' },
  { category:'Email & Web', name:'URL', pattern:'/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/', desc:'Matches http/https URLs', example:'https://example.com/path' },
  { category:'Email & Web', name:'IPv4', pattern:'/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/', desc:'Validates IPv4 address', example:'192.168.1.1' },
  { category:'Email & Web', name:'IPv6', pattern:'/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/', desc:'Validates IPv6 address (simplified)', example:'2001:0db8:85a3:0000:0000:8a2e:0370:7334' },
  { category:'Numbers', name:'Integer', pattern:'/^-?\d+$/', desc:'Positive or negative integer', example:'-42' },
  { category:'Numbers', name:'Decimal', pattern:'/^-?\d+(\.\d+)?$/', desc:'Integer or decimal number', example:'3.14' },
  { category:'Numbers', name:'Hex color', pattern:'/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', desc:'HEX color code', example:'#FF5733' },
  { category:'Numbers', name:'Credit Card', pattern:'/^4[0-9]{12}(?:[0-9]{3})?$/', desc:'Visa card number format', example:'4111111111111111' },
  { category:'Date & Time', name:'Date (YYYY-MM-DD)', pattern:'/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/', desc:'ISO date format', example:'2024-01-31' },
  { category:'Date & Time', name:'Time (HH:MM)', pattern:'/^([01]\d|2[0-3]):[0-5]\d$/', desc:'24-hour time', example:'23:59' },
  { category:'Date & Time', name:'Date (MM/DD/YYYY)', pattern:'/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/', desc:'US date format', example:'12/31/2024' },
  { category:'Identity', name:'US SSN', pattern:'/^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/', desc:'US Social Security Number', example:'123-45-6789' },
  { category:'Identity', name:'US Phone', pattern:'/^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/', desc:'US phone number', example:'(555) 123-4567' },
  { category:'Identity', name:'UUID v4', pattern:'/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', desc:'UUID v4 format', example:'550e8400-e29b-41d4-a716-446655440000' },
  { category:'Code', name:'Slug', pattern:'/^[a-z0-9]+(?:-[a-z0-9]+)*$/', desc:'URL-friendly slug', example:'my-blog-post-2024' },
  { category:'Code', name:'HTML tag', pattern:'/<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi', desc:'Matches HTML tags with content', example:'<div class="test">Hello</div>' },
  { category:'Code', name:'Semantic version', pattern:'/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/', desc:'Semantic versioning x.y.z', example:'1.2.3' },
]

const CATEGORIES = Array.from(new Set(PATTERNS.map(p=>p.category)))

export default function RegexLibraryPage({ params }: { params: { lang: string } }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [test, setTest] = useState('')
  const [selectedPattern, setSelectedPattern] = useState<typeof PATTERNS[0]|null>(null)
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('regex-library'); tracked.current = true } }

  const filtered = PATTERNS.filter(p=>{
    const q=search.toLowerCase()
    const catMatch = !activeCategory||p.category===activeCategory
    const searchMatch = !q||(p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||p.pattern.toLowerCase().includes(q))
    return catMatch&&searchMatch
  })

  function selectPattern(p: typeof PATTERNS[0]) { setSelectedPattern(p); setTest(p.example); track() }

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('regex-library')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  let testMatch: boolean|null = null
  if (selectedPattern && test) {
    try {
      const raw = selectedPattern.pattern
      const flagMatch = raw.match(/\/([a-z]*)$/)
      const flags = flagMatch?.[1]||''
      const patternStr = raw.replace(/^\/,'').replace(new RegExp('\/'+flags+'$'),'')
      testMatch = new RegExp(patternStr,flags).test(test)
    } catch { testMatch = null }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          <input value={search} onChange={e=>{setSearch(e.target.value);track()}} placeholder="Search patterns..."
            className="flex-1 min-w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={()=>setActiveCategory('')} className={'px-2.5 py-1.5 rounded-lg text-xs transition-colors ' + (!activeCategory?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>All</button>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>setActiveCategory(cat===activeCategory?'':cat)}
              className={'px-2.5 py-1.5 rounded-lg text-xs transition-colors ' + (activeCategory===cat?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
              {cat}
            </button>
          ))}
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtered.map(p=>(
            <div key={p.name} onClick={()=>selectPattern(p)}
              className={'flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ' + (selectedPattern?.name===p.name?'bg-brand-50 border-brand-200':'bg-gray-50 border-gray-200 hover:border-brand-200')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.category}</span>
                </div>
                <code className="text-xs font-mono text-brand-600 break-all">{p.pattern}</code>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();copy(p.pattern,p.name)}} className="text-xs text-brand-400 hover:text-brand-600 shrink-0">
                {copied===p.name?'\u2713':'Copy'}
              </button>
            </div>
          ))}
        </div>
        {selectedPattern && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-600">Test against: {selectedPattern.name}</label>
            <div className="flex gap-2">
              <input value={test} onChange={e=>setTest(e.target.value)} placeholder="Enter test string..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
              {testMatch !== null && (
                <div className={'px-3 py-2 rounded-xl text-sm font-medium ' + (testMatch?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-700 border border-red-200')}>
                  {testMatch?'\u2713 Match':'\u00D7 No match'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
