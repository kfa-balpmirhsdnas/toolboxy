'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('random-quote-generator')!

const QUOTES = [
  { text:"The only way to do great work is to love what you do.", author:"Steve Jobs", cat:"Motivation" },
  { text:"In the middle of every difficulty lies opportunity.", author:"Albert Einstein", cat:"Wisdom" },
  { text:"It does not matter how slowly you go as long as you do not stop.", author:"Confucius", cat:"Perseverance" },
  { text:"Life is what happens to you while you're busy making other plans.", author:"John Lennon", cat:"Life" },
  { text:"The future belongs to those who believe in the beauty of their dreams.", author:"Eleanor Roosevelt", cat:"Motivation" },
  { text:"Imagination is more important than knowledge.", author:"Albert Einstein", cat:"Creativity" },
  { text:"The best time to plant a tree was 20 years ago. The second best time is now.", author:"Chinese Proverb", cat:"Wisdom" },
  { text:"You miss 100% of the shots you don't take.", author:"Wayne Gretzky", cat:"Motivation" },
  { text:"Whether you think you can or think you can't, you're right.", author:"Henry Ford", cat:"Mindset" },
  { text:"The journey of a thousand miles begins with one step.", author:"Lao Tzu", cat:"Wisdom" },
  { text:"To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author:"Ralph Waldo Emerson", cat:"Identity" },
  { text:"Two roads diverged in a wood, and I—I took the one less traveled by.", author:"Robert Frost", cat:"Life" },
  { text:"Not everything that is faced can be changed, but nothing can be changed until it is faced.", author:"James Baldwin", cat:"Courage" },
  { text:"Success is not final, failure is not fatal: it is the courage to continue that counts.", author:"Winston Churchill", cat:"Perseverance" },
  { text:"In three words I can sum up everything I've learned about life: it goes on.", author:"Robert Frost", cat:"Life" },
  { text:"The only impossible journey is the one you never begin.", author:"Tony Robbins", cat:"Motivation" },
  { text:"Do not go where the path may lead, go instead where there is no path and leave a trail.", author:"Ralph Waldo Emerson", cat:"Creativity" },
  { text:"You only live once, but if you do it right, once is enough.", author:"Mae West", cat:"Life" },
  { text:"Be the change you wish to see in the world.", author:"Mahatma Gandhi", cat:"Wisdom" },
  { text:"It is during our darkest moments that we must focus to see the light.", author:"Aristotle", cat:"Courage" },
]

const CATS = ['All',...Array.from(new Set(QUOTES.map(q=>q.cat)))]

export default function RandomQuoteGeneratorPage({ params }: { params: { lang: string } }) {
  const [cat, setCat] = useState('All')
  const [idx, setIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('random-quote-generator'); tracked.current = true } }

  const filtered = cat==='All' ? QUOTES : QUOTES.filter(q=>q.cat===cat)
  const quote = filtered[idx % filtered.length]

  function next() {
    track()
    setIdx(i=>(i+1)%filtered.length)
  }
  function prev() { setIdx(i=>(i-1+filtered.length)%filtered.length); track() }
  function random() { setIdx(Math.floor(Math.random()*filtered.length)); track() }
  function toggleFav() {
    const qi = QUOTES.indexOf(quote)
    setFavorites(f=>f.includes(qi)?f.filter(x=>x!==qi):[...f,qi])
    track()
  }
  async function copy() {
    await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`)
    trackToolCopy('random-quote-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATS.map(c=>(
            <button key={c} onClick={()=>{setCat(c);setIdx(0);track()}}
              className={'px-3 py-1 rounded-lg text-xs transition-colors ' + (cat===c?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {c}
            </button>
          ))}
        </div>
        <div className="p-6 bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 rounded-2xl min-h-36 flex flex-col justify-between">
          <p className="text-lg font-medium text-gray-800 leading-relaxed italic">"{quote.text}"</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">— {quote.author}</span>
            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs">{quote.cat}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={prev} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">‹ Prev</button>
          <button onClick={next} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">Next ›</button>
          <button onClick={random} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold">🎲 Random</button>
          <button onClick={toggleFav} className={'px-4 py-2 rounded-xl text-sm ' + (favorites.includes(QUOTES.indexOf(quote))?'bg-red-50 text-red-600':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {favorites.includes(QUOTES.indexOf(quote))?'♥ Saved':'♡ Save'}
          </button>
          <button onClick={copy} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">{copied?'✓ Copied':'Copy'}</button>
        </div>
        <p className="text-xs text-gray-400 text-center">{filtered.length} quotes · #{(idx%filtered.length)+1}</p>
      </div>
    </ToolLayout>
  )
}
