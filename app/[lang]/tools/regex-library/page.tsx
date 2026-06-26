'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('regex-library')!

const PATTERNS = [
  { category:'Email', name:'Email', pattern:'/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$/', desc:'Standard email address', example:'user@example.com' },
  { category:'URL', name:'URL (http/https)', pattern:'/^https?:\/\/[^\s/$.?#].[^\s]*$/', desc:'HTTP or HTTPS URL', example:'https://example.com' },
  { category:'Phone', name:'US Phone', pattern:'/^[+]?[1]?[\s.-]?[(]?[0-9]{3}[)]?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/', desc:'US phone number', example:'(555) 123-4567' },
  { category:'Date', name:'ISO Date', pattern:'/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/', desc:'YYYY-MM-DD date format', example:'2024-01-15' },
  { category:'Date', name:'US Date', pattern:'/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/[0-9]{4}$/', desc:'MM/DD/YYYY date format', example:'01/15/2024' },
  { category:'Number', name:'Integer', pattern:'/^-?[0-9]+$/', desc:'Positive or negative integer', example:'42' },
  { category:'Number', name:'Decimal', pattern:'/^-?[0-9]+([.][0-9]+)?$/', desc:'Integer or decimal number', example:'3.14' },
  { category:'Number', name:'Currency', pattern:'/^[$]?[0-9]{1,3}(,[0-9]{3})*([.][0-9]{2})?$/', desc:'US currency format', example:'$1,234.56' },
  { category:'Identity', name:'UUID v4', pattern:'/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', desc:'UUID v4 format', example:'550e8400-e29b-41d4-a716-446655440000' },
  { category:'Identity', name:'IPv4', pattern:'/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.]){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/', desc:'IPv4 address', example:'192.168.1.1' },
  { category:'Code', name:'Slug', pattern:'/^[a-z0-9]+(?:-[a-z0-9]+)*$/', desc:'URL-friendly slug', example:'my-blog-post-2024' },
  { category:'Code', name:'Hex Color', pattern:'/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', desc:'CSS hex color', example:'#FF5733' },
  { category:'Code', name:'Semantic version', pattern:'/^(0|[1-9][0-9]*)([.](0|[1-9][0-9]*)){2}$/', desc:'Semantic versioning x.y.z', example:'1.2.3' },
  { category:'Text', name:'Whitespace only', pattern:'/^\s+$/', desc:'Only whitespace characters', example:'   ' },
  { category:'Text', name:'Alphanumeric', pattern:'/^[a-zA-Z0-9]+$/', desc:'Letters and numbers only', example:'Hello123' },
  { category:'Text', name:'No special chars', pattern:'/^[a-zA-Z0-9 ]+$/', desc:'Letters, numbers, spaces', example:'Hello World' },
]

const categories = ['All', ...Array.from(new Set(PATTERNS.map(p => p.category)))]

export default function RegexLibraryPage() {
  const t = useTranslations('toolui')
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [testInput, setTestInput] = useState('')
  const [activePattern, setActivePattern] = useState<string|null>(null)
  const [copied, setCopied] = useState<string|null>(null)

  const filtered = PATTERNS.filter(p =>
    (cat === 'All' || p.category === cat) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()))
  )

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const testRegex = (pattern: string) => {
    if (!testInput) return null
    try {
      const m = pattern.match(/^\/(.+)\/([gimsuy]*)$/)
      if (!m) return null
      const re = new RegExp(m[1], m[2])
      return re.test(testInput)
    } catch { return null }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('rl_search')}
            className="flex-1 border rounded px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={['px-3 py-1 rounded text-sm', cat === c ? 'bg-indigo-600 text-white' : 'bg-gray-100'].join(' ')}>
              {c === 'All' ? t('rl_all') : c}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map(p => {
            const testResult = activePattern === p.name ? testRegex(p.pattern) : null
            return (
              <div key={p.name} className="border rounded p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-indigo-600 font-medium">{p.category}</span>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </div>
                  <button onClick={() => copy(p.pattern, p.name)}
                    className="px-2 py-1 bg-gray-100 rounded text-xs ml-2">
                    {copied === p.name ? t('ui_copied') : t('ui_copy')}
                  </button>
                </div>
                <code className="block bg-gray-50 rounded p-2 text-xs font-mono mb-2">{p.pattern}</code>
                <div className="flex gap-2 items-center">
                  <input placeholder={p.example} value={activePattern === p.name ? testInput : ''}
                    onChange={e => { setTestInput(e.target.value); setActivePattern(p.name) }}
                    onFocus={() => setActivePattern(p.name)}
                    className="flex-1 border rounded px-2 py-1 text-sm" />
                  {testResult !== null && (
                    <span className={['text-sm font-medium', testResult ? 'text-green-600' : 'text-red-500'].join(' ')}>
                      {testResult ? t('rl_match') : t('rl_nomatch')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}