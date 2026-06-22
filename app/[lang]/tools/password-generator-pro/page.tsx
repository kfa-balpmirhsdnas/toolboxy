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
  const copyAll=()=>{navigator.clipboard.writeText(passwords.join('
'));setCopied('all');setTimeout(()=>setCopied(''),1500)}
  const Check=({label,val,set}:{label:string;val:boolean;set:(v:boolean)=>void})=>(
    <label className="flex items-center gap-2 cursor-pointer text-sm">
      <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} className="rounded w-4 h-4"/>
      {label}
    </label>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Length</label>
            <span className="text-blue-600 font-bold">{len}</span>
          </div>
          <input type="range" min="4" max="64" value={len} onChange={e=>setLen(Number(e.target.value))} className="w-full"/>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>4</span><span>64</span></div>
        </div>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 bg-gray-50 rounded-xl p-4">
          <Check label="Uppercase (A-Z)" val={upper} set={setUpper}/>
          <Check label="Lowercase (a-z)" val={lower} set={setLower}/>
          <Check label="Digits (0-9)" val={digits} set={setDigits}/>
          <Check label="Symbols (!@#...)" val={syms} set={setSyms}/>
          <Check label="Exclude ambiguous (0O1lI)" val={noAmb} set={setNoAmb}/>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Count:</span>
            {[1,5,10,20].map(n=>(
              <button key={n} onClick={()=>setCount(n)}
                className={'w-9 h-7 rounded border text-xs font-medium transition '+(count===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{n}</button>
            ))}
          </div>
        </div>
        <button onClick={generate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-lg">Generate</button>
        {passwords.length>0&&(
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{passwords.length} password{passwords.length>1?'s':''} generated</span>
              <button onClick={copyAll} className="text-xs text-blue-600 hover:underline">{copied==='all'?'Copied all!':'Copy all'}</button>
            </div>
            {passwords.map((p,i)=>{
              const s=strength(p)
              const {label,color}=strengthLabel(s)
              return (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <code className="flex-1 font-mono text-sm text-gray-800 break-all">{p}</code>
                  <div className="flex-shrink-0 text-right">
                    <span className={'text-xs font-medium px-1.5 py-0.5 rounded text-white '+color}>{label}</span>
                  </div>
                  <button onClick={()=>copy(p)} className="flex-shrink-0 text-xs text-blue-600 hover:underline w-12">{copied===p?'Copied!':'Copy'}</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}