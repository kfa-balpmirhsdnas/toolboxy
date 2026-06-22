'use client'
import { useState } from 'react'

const ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']

function convert(n:number):string{
  if(n===0) return 'zero'
  if(n<0) return 'negative '+convert(-n)
  if(n<20) return ones[n]
  if(n<100) return tens[Math.floor(n/10)]+(n%10?' '+ones[n%10]:'')
  if(n<1000) return ones[Math.floor(n/100)]+' hundred'+(n%100?' '+convert(n%100):'')
  if(n<1000000) return convert(Math.floor(n/1000))+' thousand'+(n%1000?' '+convert(n%1000):'')
  if(n<1000000000) return convert(Math.floor(n/1000000))+' million'+(n%1000000?' '+convert(n%1000000):'')
  if(n<1000000000000) return convert(Math.floor(n/1000000000))+' billion'+(n%1000000000?' '+convert(n%1000000000):'')
  return convert(Math.floor(n/1000000000000))+' trillion'+(n%1000000000000?' '+convert(n%1000000000000):'')
}

function toOrdinal(n:number):string{
  const s=['th','st','nd','rd']
  const v=n%100
  return n+(s[(v-20)%10]||s[v]||s[0])
}

export default function NumberToWordsPage() {
  const [input,setInput]=useState('1234567')
  const [lang,setLang]=useState<'en'|'ordinal'>('en')

  const num=parseFloat(input.replace(/,/g,''))
  const intPart=Math.floor(Math.abs(num))
  const decPart=input.includes('.')?input.split('.')[1]:null

  const words=!isNaN(num)&&intPart<=999999999999999?
    (num<0?'negative ':'')+convert(intPart)+(decPart?' point '+decPart.split('').map((d:string)=>ones[parseInt(d)]||'zero').join(' '):'')
    :'Number too large (max 999 trillion)'

  const ordWords=!isNaN(intPart)&&intPart<=999999999999999?toOrdinal(intPart):'—'

  const formatted=!isNaN(num)?num.toLocaleString('en-US'):''

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number to Words</h1>
        <p className="text-gray-500 mb-8">Convert numbers to their English word equivalents</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter a number</label>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Enter number..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {formatted&&<p className="text-xs text-gray-400 mt-1">{formatted}</p>}
          </div>
          {!isNaN(num)&&(
            <div className="space-y-3">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">In words</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{words}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Ordinal</p>
                <p className="text-lg font-semibold text-gray-900">{ordWords}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Roman numerals',intPart>0&&intPart<=3999?toRoman(intPart):'Out of range (1-3999)'],['Scientific notation',num!==0?num.toExponential(3):'0']].map(([l,v])=>(
                  <div key={l as string} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{l as string}</p>
                    <p className="font-mono font-bold text-gray-800">{v as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function toRoman(num:number):string{
  const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result=''
  vals.forEach((v,i)=>{while(num>=v){result+=syms[i];num-=v}})
  return result
}