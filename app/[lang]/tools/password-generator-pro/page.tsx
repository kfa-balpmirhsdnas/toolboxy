'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('password-generator-pro')!
const UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER='abcdefghijklmnopqrstuvwxyz'
const DIGITS='0123456789'
const SYMS='!@#$%^&*()-_=+[]{}|;:,.<>?'
const AMBIG='0O1lI'
function strength(p:string):number{
  let s=0
  if(p.length>=8)s+=1
  if(p.length>=12)s+=1
  if(p.length>=16)s+=1
  if(/[A-Z]/.test(p))s+=1
  if(/[a-z]/.test(p))s+=1
  if(/[0-9]/.test(p))s+=1
  if(/[^A-Za-z0-9]/.test(p))s+=1
  return s
}
function strengthLabel(s:number):{label:string;color:string}{
  if(s<=2)return{label:'Weak',color:'bg-red-500'}
  if(s<=4)return{label:'Fair',color:'bg-yellow-500'}
  if(s<=5)return{label:'Good',color:'bg-blue-500'}
  return{label:'Strong',color:'bg-green-500'}
}
export default function PasswordGeneratorProPage() {
  const [len,setLen]=useState(16)
  const [upper,setUpper]=useState(true)
  const [lower,setLower]=useState(true)
  const [digits,setDigits]=useState(true)
  const [syms,setSyms]=useState(true)
  const [noAmb,setNoAmb]=useState(false)
  const [count,setCount]=useState(5)
  const [passwords,setPasswords]=useState<string[]>([])
  const [copied,setCopied]=useState('')
  const generate=useCallback(()=>{
    let chars=(upper?UPPER:'')+(lower?LOWER:'')+(digits?DIGITS:'')+(syms?SYMS:'')
    if(!chars)chars=LOWER
    if(noAmb)chars=[...chars].filter(c=>!AMBIG.includes(c)).join('')
    const arr=Array.from({length:count},()=>{
      let p=''
      const arr2=new Uint32Array(len)
      crypto.getRandomValues(arr2)
      for(let i=0;i<len;i++)p+=chars[arr2[i]%chars.length]
      return p
    })
    setPasswords(arr)
  },[len,upper,lower,digits,syms,noAmb,count])
  const copy=(p:string)=>{navigator.clipboard.writeText(p);setCopied(p);setTimeout(()=>setCopied(''),1500)}
  const copyAll=()=>{navigator.clipboard.writeText(passwords.join('\n'));setCopied('all');setTimeout(()=>setCopied(''),1500)}\n  const Check=({label,val,set}:{label:string;val:boolean;set:(v:boolean)=>void})=>(\n    <label className="flex items-center gap-2 cursor-pointer text-sm">\n      <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} className="rounded w-4 h-4"/>\n      {label}\n    </label>\n  )\n  return (\n    <ToolLayout tool={tool}>\n      <div className="max-w-lg mx-auto px-4 space-y-4">\n        <div>\n          <div className="flex justify-between mb-1">\n            <label className="text-sm font-medium text-gray-700">Length</label>\n            <span className="text-blue-600 font-bold">{len}</span>\n          </div>\n          <input type="range" min="4" max="64" value={len} onChange={e=>setLen(Number(e.target.value))} className="w-full"/>\n          <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>4</span><span>64</span></div>\n        </div>\n        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 bg-gray-50 rounded-xl p-4">\n          <Check label="Uppercase (A-Z)" val={upper} set={setUpper}/>\n          <Check label="Lowercase (a-z)" val={lower} set={setLower}/>\n          <Check label="Digits (0-9)" val={digits} set={setDigits}/>\n          <Check label="Symbols (!@#...)" val={syms} set={setSyms}/>\n          <Check label="Exclude ambiguous (0O1lI)" val={noAmb} set={setNoAmb}/>\n          <div className="flex items-center gap-2">\n            <span className="text-sm text-gray-700">Count:</span>\n            {[1,5,10,20].map(n=>(\n              <button key={n} onClick={()=>setCount(n)}\n                className={'w-9 h-7 rounded border text-xs font-medium transition '+(count===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{n}</button>\n            ))}\n          </div>\n        </div>\n        <button onClick={generate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-lg">Generate</button>\n        {passwords.length>0&&(\n          <div className="space-y-2">\n            <div className="flex justify-between items-center">\n              <span className="text-xs text-gray-500">{passwords.length} password{passwords.length>1?'s':''} generated</span>\n              <button onClick={copyAll} className="text-xs text-blue-600 hover:underline">{copied==='all'?'Copied all!':'Copy all'}</button>\n            </div>\n            {passwords.map((p,i)=>{\n              const s=strength(p)\n              const {label,color}=strengthLabel(s)\n              return (\n                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">\n                  <code className="flex-1 font-mono text-sm text-gray-800 break-all">{p}</code>\n                  <div className="flex-shrink-0 text-right">\n                    <span className={'text-xs font-medium px-1.5 py-0.5 rounded text-white '+color}>{label}</span>\n                  </div>\n                  <button onClick={()=>copy(p)} className="flex-shrink-0 text-xs text-blue-600 hover:underline w-12">{copied===p?'Copied!':'Copy'}</button>\n                </div>\n              )\n            })}\n          </div>\n        )}\n      </div>\n    </ToolLayout>\n  )\n}