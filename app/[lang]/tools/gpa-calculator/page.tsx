'use client'
import { useState } from 'react'

type Scale = '4.0'|'5.0'|'10.0'|'100'

type Course={id:number;name:string;grade:string;credits:string}

const GRADE_MAP:{[key:string]:{gpa4:number,gpa5:number}}={
  'A+': {gpa4:4.0,gpa5:5.0},'A': {gpa4:4.0,gpa5:5.0},'A-': {gpa4:3.7,gpa5:4.7},
  'B+': {gpa4:3.3,gpa5:4.3},'B': {gpa4:3.0,gpa5:4.0},'B-': {gpa4:2.7,gpa5:3.7},
  'C+': {gpa4:2.3,gpa5:3.3},'C': {gpa4:2.0,gpa5:3.0},'C-': {gpa4:1.7,gpa5:2.7},
  'D+': {gpa4:1.3,gpa5:2.3},'D': {gpa4:1.0,gpa5:2.0},'D-': {gpa4:0.7,gpa5:1.7},'F': {gpa4:0,gpa5:0},
}

function gpaColor(gpa:number,max:number):string{
  const pct=gpa/max
  if(pct>=0.85) return 'text-green-600'
  if(pct>=0.7) return 'text-blue-600'
  if(pct>=0.6) return 'text-yellow-600'
  return 'text-red-500'
}

export default function GpaCalculatorPage() {
  const [scale,setScale]=useState<Scale>('4.0')
  const [courses,setCourses]=useState<Course[]>([
    {id:1,name:'Mathematics',grade:'A',credits:'3'},
    {id:2,name:'English',grade:'B+',credits:'3'},
    {id:3,name:'Physics',grade:'A-',credits:'4'},
  ])
  const [nextId,setNextId]=useState(4)

  function add(){setCourses(c=>[...c,{id:nextId,name:'',grade:'A',credits:'3'}]);setNextId(n=>n+1)}
  function remove(id:number){setCourses(c=>c.filter(x=>x.id!==id))}
  function update(id:number,f:keyof Course,v:string){setCourses(c=>c.map(x=>x.id===id?{...x,[f]:v}:x))}

  const totalCredits=courses.reduce((s,c)=>s+(parseFloat(c.credits)||0),0)
  const gpaKey=scale==='4.0'||scale==='100'?'gpa4':'gpa5'
  const totalPoints=courses.reduce((s,c)=>{
    const gMap=GRADE_MAP[c.grade]
    if(!gMap) return s
    let pts=gMap[gpaKey]
    if(scale==='10.0') pts=pts/4*10
    if(scale==='100') pts=pts/4*100
    return s+pts*(parseFloat(c.credits)||0)
  },0)
  const gpa=totalCredits>0?totalPoints/totalCredits:0
  const maxGpa=parseFloat(scale)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GPA Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your GPA across multiple courses with credit weighting</p>
        <div className="flex gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 self-center">Scale:</span>
          {(['4.0','5.0','10.0','100'] as Scale[]).map(s=>(
            <button key={s} onClick={()=>setScale(s)} className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors '+(scale===s?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>{s}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs font-medium text-gray-500 px-1">
            <span>Course</span><span>Grade</span><span>Credits</span><span/>
          </div>
          {courses.map(c=>(
            <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <input value={c.name} onChange={e=>update(c.id,'name',e.target.value)} placeholder="Course name"
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select value={c.grade} onChange={e=>update(c.id,'grade',e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                {Object.keys(GRADE_MAP).map(g=><option key={g} value={g}>{g}</option>)}
              </select>
              <input type="number" value={c.credits} onChange={e=>update(c.id,'credits',e.target.value)} min={1} max={6}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
              <button onClick={()=>remove(c.id)} className="text-gray-400 hover:text-red-500">\u00D7</button>
            </div>
          ))}
          <button onClick={add} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">+ Add Course</button>
        </div>
        {totalCredits>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cumulative GPA ({scale} scale)</p>
              <p className={'text-5xl font-black '+gpaColor(gpa,maxGpa)}>{gpa.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Total Credits: <strong>{totalCredits}</strong></p>
              <p>Courses: <strong>{courses.length}</strong></p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}