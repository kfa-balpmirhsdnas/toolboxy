'use client'
import { useState } from 'react'

const SIGNS=[
  {name:'Aries',emoji:'\u2648',start:[3,21],end:[4,19],element:'Fire',planet:'Mars',traits:['Bold','Adventurous','Energetic','Courageous'],desc:'The first sign of the zodiac, Aries is a natural-born leader. Bold and ambitious, they dive headfirst into even the most challenging situations.'},
  {name:'Taurus',emoji:'\u2649',start:[4,20],end:[5,20],element:'Earth',planet:'Venus',traits:['Reliable','Patient','Devoted','Stubborn'],desc:'Taurus is an earth sign represented by the bull. They enjoy relaxing in serene, bucolic environments surrounded by soft sounds and soothing aromas.'},
  {name:'Gemini',emoji:'\u264A',start:[5,21],end:[6,20],element:'Air',planet:'Mercury',traits:['Gentle','Curious','Adaptable','Witty'],desc:'Gemini is a versatile and curious sign. They are social butterflies who can talk to anyone about anything, adapting easily to different situations.'},
  {name:'Cancer',emoji:'\u264B',start:[6,21],end:[7,22],element:'Water',planet:'Moon',traits:['Tenacious','Loyal','Emotional','Intuitive'],desc:'Cancer is a cardinal water sign deeply intuitive and sentimental. They are very loyal to their family and friends and are known for their nurturing nature.'},
  {name:'Leo',emoji:'\u264C',start:[7,23],end:[8,22],element:'Fire',planet:'Sun',traits:['Creative','Generous','Warm-hearted','Dramatic'],desc:'Leo is represented by the lion and is known for being one of the most vibrant signs of the zodiac. Natural leaders, they love being in the spotlight.'},
  {name:'Virgo',emoji:'\u264D',start:[8,23],end:[9,22],element:'Earth',planet:'Mercury',traits:['Practical','Loyal','Analytical','Hardworking'],desc:'Virgo is an earth sign with a systematic approach to life. Practical and detail-oriented, they are reliable people who strive for perfection.'},
  {name:'Libra',emoji:'\u264E',start:[9,23],end:[10,22],element:'Air',planet:'Venus',traits:['Cooperative','Diplomatic','Gracious','Social'],desc:'Libra is obsessed with symmetry and strives to create equilibrium in all areas of life. They are natural diplomats who value fairness and justice.'},
  {name:'Scorpio',emoji:'\u264F',start:[10,23],end:[11,21],element:'Water',planet:'Pluto',traits:['Resourceful','Brave','Passionate','Stubborn'],desc:'Scorpio is a water sign that uses emotional energy as fuel, cultivating powerful wisdom from both psychological and spiritual growth.'},
  {name:'Sagittarius',emoji:'\u2650',start:[11,22],end:[12,21],element:'Fire',planet:'Jupiter',traits:['Generous','Idealistic','Great humor','Impatient'],desc:'Sagittarius is a fire sign that launches its many pursuits like blazing arrows. It is the archer of the zodiac — represented by a centaur.'},
  {name:'Capricorn',emoji:'\u2651',start:[12,22],end:[1,19],element:'Earth',planet:'Saturn',traits:['Disciplined','Self-controlled','Responsible','Unforgiving'],desc:'Capricorn is climbing the mountain of success — practical, ambitiously driven, and determined. They embody perseverance and self-reliance.'},
  {name:'Aquarius',emoji:'\u2652',start:[1,20],end:[2,18],element:'Air',planet:'Uranus',traits:['Progressive','Original','Independent','Humanitarian'],desc:'Aquarius is an air sign despite the word aqua in its name. They are the most humanitarian sign, using their energy to benefit humanity.'},
  {name:'Pisces',emoji:'\u2653',start:[2,19],end:[3,20],element:'Water',planet:'Neptune',traits:['Compassionate','Artistic','Intuitive','Gentle'],desc:'Pisces is the most sensitive sign of the zodiac. They are empathetic dreamers who feel deeply connected to the world around them.'},
]

function getSign(month:number,day:number){
  for(const s of SIGNS){
    const [sm,sd]=s.start,[em,ed]=s.end
    if((month===sm&&day>=sd)||(month===em&&day<=ed)) return s
    if(s.name==='Capricorn'&&((month===12&&day>=22)||(month===1&&day<=19))) return s
  }
  return null
}

const ELEM_COLORS:Record<string,string>={Fire:'text-red-500',Earth:'text-green-600',Air:'text-blue-500',Water:'text-cyan-500'}

export default function ZodiacSignPage() {
  const [date,setDate]=useState('')

  const d=date?new Date(date):null
  const sign=d?getSign(d.getMonth()+1,d.getDate()):null

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zodiac Sign Finder</h1>
        <p className="text-gray-500 mb-8">Find your zodiac sign and discover your traits, element, and ruling planet</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        {sign&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{sign.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{sign.name}</h2>
                <div className="flex gap-3 mt-1 text-sm">
                  <span className={ELEM_COLORS[sign.element]+' font-medium'}>{sign.element}</span>
                  <span className="text-gray-400">\u25CF</span>
                  <span className="text-gray-600">\u2609 {sign.planet}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{sign.desc}</p>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Traits</h3>
              <div className="flex flex-wrap gap-2">
                {sign.traits.map(t=>(<span key={t} className="bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full border border-brand-100">{t}</span>))}
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {SIGNS.map(s=>(
            <button key={s.name} onClick={()=>{
              const yr=new Date().getFullYear()
              const testDate=new Date(yr,s.start[0]-1,s.start[1])
              setDate(testDate.toISOString().split('T')[0])
            }} title={s.name} className="bg-white rounded-xl border border-gray-200 p-2 text-center hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="text-2xl">{s.emoji}</div>
              <div className="text-xs text-gray-500 truncate">{s.name}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}