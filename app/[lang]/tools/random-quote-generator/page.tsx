'use client'
import { useState, useEffect } from 'react'

type Quote={text:string;author:string;category:string}

const QUOTES:Quote[]=[
  {text:'The only way to do great work is to love what you do.',author:'Steve Jobs',category:'Motivation'},
  {text:'Life is what happens when you\'re busy making other plans.',author:'John Lennon',category:'Life'},
  {text:'The future belongs to those who believe in the beauty of their dreams.',author:'Eleanor Roosevelt',category:'Inspiration'},
  {text:'It is during our darkest moments that we must focus to see the light.',author:'Aristotle',category:'Hope'},
  {text:'Spread love everywhere you go. Let no one ever come to you without leaving happier.',author:'Mother Teresa',category:'Love'},
  {text:'When you reach the end of your rope, tie a knot in it and hang on.',author:'Franklin D. Roosevelt',category:'Perseverance'},
  {text:'Always remember that you are absolutely unique. Just like everyone else.',author:'Margaret Mead',category:'Humor'},
  {text:'Do not go where the path may lead, go instead where there is no path and leave a trail.',author:'Ralph Waldo Emerson',category:'Leadership'},
  {text:'You will face many defeats in life, but never let yourself be defeated.',author:'Maya Angelou',category:'Resilience'},
  {text:'In the end, it\'s not the years in your life that count. It\'s the life in your years.',author:'Abraham Lincoln',category:'Life'},
  {text:'Never let the fear of striking out keep you from playing the game.',author:'Babe Ruth',category:'Courage'},
  {text:'The greatest glory in living lies not in never falling, but in rising every time we fall.',author:'Nelson Mandela',category:'Resilience'},
  {text:'Life is either a daring adventure or nothing at all.',author:'Helen Keller',category:'Courage'},
  {text:'Many of life\'s failures are people who did not realize how close they were to success when they gave up.',author:'Thomas A. Edison',category:'Perseverance'},
  {text:'You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.',author:'Dr. Seuss',category:'Inspiration'},
  {text:'If life were predictable it would cease to be life, and be without flavor.',author:'Eleanor Roosevelt',category:'Life'},
  {text:'If you look at what you have in life, you\'ll always have more.',author:'Oprah Winfrey',category:'Gratitude'},
  {text:'If you want to live a happy life, tie it to a goal, not to people or things.',author:'Albert Einstein',category:'Happiness'},
  {text:'Success is not final; failure is not fatal. It is the courage to continue that counts.',author:'Winston Churchill',category:'Success'},
  {text:'Tell me and I forget. Teach me and I remember. Involve me and I learn.',author:'Benjamin Franklin',category:'Learning'},
  {text:'The best time to plant a tree was 20 years ago. The second best time is now.',author:'Chinese Proverb',category:'Action'},
  {text:'An unexamined life is not worth living.',author:'Socrates',category:'Philosophy'},
  {text:'Spread your wings and let the fairy in you fly.',author:'Anonymous',category:'Inspiration'},
  {text:'Innovation distinguishes between a leader and a follower.',author:'Steve Jobs',category:'Leadership'},
  {text:'The only impossible journey is the one you never begin.',author:'Tony Robbins',category:'Action'},
  {text:'In the middle of every difficulty lies opportunity.',author:'Albert Einstein',category:'Motivation'},
  {text:'Believe you can and you\'re halfway there.',author:'Theodore Roosevelt',category:'Confidence'},
  {text:'It always seems impossible until it\'s done.',author:'Nelson Mandela',category:'Perseverance'},
]

const CATEGORIES=[...new Set(QUOTES.map(q=>q.category))]

export default function RandomQuoteGeneratorPage() {
  const [category,setCategory]=useState('All')
  const [current,setCurrent]=useState(0)
  const [copied,setCopied]=useState(false)
  const [favorites,setFavorites]=useState<number[]>([])

  const filtered=category==='All'?QUOTES:QUOTES.filter(q=>q.category===category)
  const quote=filtered[current%filtered.length]

  function next(){setCurrent(c=>(c+1)%filtered.length)}
  function random(){setCurrent(Math.floor(Math.random()*filtered.length))}
  function copy(){navigator.clipboard.writeText('\"'+quote.text+'\" — '+quote.author);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  function toggleFav(){const idx=QUOTES.indexOf(quote);setFavorites(f=>f.includes(idx)?f.filter(x=>x!==idx):[...f,idx])}

  useEffect(()=>{setCurrent(0)},[category])

  const isFav=favorites.includes(QUOTES.indexOf(quote))

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Generator</h1>
        <p className="text-gray-500 mb-8">Discover inspiring quotes from history\'s greatest minds</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['All',...CATEGORIES]).map(c=>(
            <button key={c} onClick={()=>setCategory(c)} className={'px-3 py-1.5 text-sm rounded-full font-medium transition-colors '+(category===c?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-brand-300')}>
              {c}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative min-h-[220px] flex flex-col justify-between">
          <div>
            <div className="text-5xl text-brand-200 font-serif mb-4">\u201C</div>
            <p className="text-lg text-gray-800 leading-relaxed italic">{quote.text}</p>
            <p className="text-sm text-gray-500 mt-4">\u2014 {quote.author}</p>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{quote.category}</span>
            <div className="flex-1" />
            <button onClick={toggleFav} className={'text-xl '+(isFav?'text-red-500':'text-gray-300 hover:text-red-400')}>{isFav?'\u2665':'\u2661'}</button>
            <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713':'Copy'}</button>
            <button onClick={random} className="text-xs px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg">Random</button>
            <button onClick={next} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">Next</button>
          </div>
        </div>
        {favorites.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Favorites ({favorites.length})</h2>
            <div className="space-y-3">
              {favorites.map(i=>(<div key={i} className="text-sm text-gray-600 italic border-l-2 border-brand-300 pl-3">{QUOTES[i].text}<span className="block text-xs text-gray-400 mt-0.5 not-italic">\u2014 {QUOTES[i].author}</span></div>))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}