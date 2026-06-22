'use client'
import { useState } from 'react'

const ENTITIES:{char:string;entity:string;code:string;name:string}[]=[
  {char:'&',entity:'&amp;',code:'&#38;',name:'Ampersand'},
  {char:'<',entity:'&lt;',code:'&#60;',name:'Less Than'},
  {char:'>',entity:'&gt;',code:'&#62;',name:'Greater Than'},
  {char:'"',entity:'&quot;',code:'&#34;',name:'Quotation Mark'},
  {char:"'",entity:'&apos;',code:'&#39;',name:'Apostrophe'},
  {char:'\u00A9',entity:'&copy;',code:'&#169;',name:'Copyright'},
  {char:'\u00AE',entity:'&reg;',code:'&#174;',name:'Registered'},
  {char:'\u2122',entity:'&trade;',code:'&#8482;',name:'Trademark'},
  {char:'\u20AC',entity:'&euro;',code:'&#8364;',name:'Euro'},
  {char:'\u00A3',entity:'&pound;',code:'&#163;',name:'Pound'},
  {char:'\u00A5',entity:'&yen;',code:'&#165;',name:'Yen'},
  {char:'\u00B0',entity:'&deg;',code:'&#176;',name:'Degree'},
  {char:'\u00B1',entity:'&plusmn;',code:'&#177;',name:'Plus-Minus'},
  {char:'\u00D7',entity:'&times;',code:'&#215;',name:'Multiplication'},
  {char:'\u00F7',entity:'&divide;',code:'&#247;',name:'Division'},
  {char:'\u2026',entity:'&hellip;',code:'&#8230;',name:'Ellipsis'},
  {char:'\u2014',entity:'&mdash;',code:'&#8212;',name:'Em Dash'},
  {char:'\u2013',entity:'&ndash;',code:'&#8211;',name:'En Dash'},
]

function encodeHtml(text:string):string{
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')
}
function decodeHtml(text:string):string{
  const d=document.createElement('div');d.innerHTML=text;return d.textContent||''
}

export default function HtmlEntityEncoderPage() {
  const [input,setInput]=useState('<div class="hello">Hello & World!</div>')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [copied,setCopied]=useState(false)

  const output=mode==='encode'?encodeHtml(input):decodeHtml(input)
  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function swap(){setInput(output);setMode(m=>m==='encode'?'decode':'encode')}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML Entity Encoder</h1>
        <p className="text-gray-500 mb-8">Encode or decode HTML entities and special characters</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={()=>setMode('encode')} className={'flex-1 py-2 rounded-lg font-medium '+(mode==='encode'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Encode</button>
            <button onClick={()=>setMode('decode')} className={'flex-1 py-2 rounded-lg font-medium '+(mode==='decode'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Decode</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Output</label>
              <div className="flex gap-2">
                <button onClick={swap} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">\u21C5 Swap</button>
                <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-700 break-all min-h-[80px] whitespace-pre-wrap">{output}</div>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Common HTML Entities</h2>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500"><th className="text-left py-1 pr-3">Char</th><th className="text-left py-1 pr-3">Named</th><th className="text-left py-1 pr-3">Numbered</th><th className="text-left py-1">Name</th></tr></thead>
              <tbody>
                {ENTITIES.map(e=>(
                  <tr key={e.char} className="border-t border-gray-50">
                    <td className="py-1 pr-3 font-bold text-gray-800">{e.char}</td>
                    <td className="py-1 pr-3 font-mono text-brand-600">{e.entity}</td>
                    <td className="py-1 pr-3 font-mono text-gray-500">{e.code}</td>
                    <td className="py-1 text-gray-500">{e.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}