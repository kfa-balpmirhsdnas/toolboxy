'use client'
import { useState } from 'react'

const NATO:Record<string,string>={
  A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',
  N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
  '.':'Decimal',',':'Comma','?':'Query','!':'Exclamation','@':'At','#':'Hash','&':'Ampersand','$':'Dollar','%':'Percent',
  '+':'Plus','-':'Dash','/':'Slash','\\':'Backslash','(':' Open-Paren',')'/ 'Close-Paren'}

function convert(text:string):string[]{
  return text.toUpperCase().split('').map(c=>{
    if(c===' ')return '(space)'
    return NATO[c]?NATO[c]:'['+c+']'
  })
}

export default function NatoAlphabetPage() {
  const [input,setInput]=useState('')
  const [copied,setCopied]=useState(false)

  const tokens=input?convert(input):[]
  const output=tokens.join(' ')

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NATO Phonetic Alphabet</h1>
        <p className="text-gray-500 mb-8">Convert text to NATO phonetic alphabet spelling (Alpha, Bravo, Charlie...)</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. Hello World"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {tokens.length>0&&(
            <>
              <div className="flex flex-wrap gap-2">
                {input.toUpperCase().split('').map((c,i)=>(
                  <div key={i} className="flex flex-col items-center">
                    <div className={'w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center '+(c===' '?'bg-gray-100 text-gray-300':'bg-brand-50 text-brand-700')}>
                      {c===' '?'\u00B7':c}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 max-w-[60px] text-center leading-tight">{tokens[i]}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-600 flex-1">{output}</p>
                <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg shrink-0">{copied?'\u2713 Copied':'Copy'}</button>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Full NATO Alphabet</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Object.entries(NATO).slice(0,26).map(([l,w])=>(
              <div key={l} className="bg-gray-50 rounded-lg px-2 py-2 text-center">
                <div className="font-bold text-brand-600">{l}</div>
                <div className="text-xs text-gray-500 truncate">{w}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}