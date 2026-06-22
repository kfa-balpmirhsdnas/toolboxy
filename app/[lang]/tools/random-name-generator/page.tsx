'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const FIRST_M=['James','John','Robert','Michael','William','David','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald']
const FIRST_F=['Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah']
const LAST=['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris']
const MIDDLE=['A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T','W']

const FANTASY_FIRST=['Aerin','Balthazar','Caelum','Dawnwhisper','Elara','Fenrick','Galadrielle','Hadeon','Isolde','Jareth','Kaelthas','Lyria','Mordecai','Nyx','Oberon','Phaedra','Quillon','Rhiannon','Sylvara','Thalion','Umbra','Vex','Wyrmwood','Xanthe','Ysolde','Zephyra']
const FANTASY_LAST=['Shadowmend','Brightforge','Moonwhisper','Duskbane','Stormcaller','Ironveil','Swiftarrow','Coldwater','Emberveil','Thornwood','Starweaver','Nightfall','Goldenleaf','Frostborne','Wraithbane']

const BUSINESS=['Alpha','Beta','Apex','Nexus','Prime','Summit','Zenith','Nova','Quantum','Titan','Vortex','Eclipse','Horizon','Pinnacle','Vertex','Cipher','Cobalt','Fusion','Lynx','Mosaic']
const BUSINESS_SUFFIX=['Solutions','Technologies','Group','Partners','Ventures','Digital','Systems','Labs','Works','Connect','Hub','Co']

type GenType='realistic'|'fantasy'|'business'

function genRealistic(sex:'male'|'female'|'random',middle:boolean):string{
  const isMale=sex==='male'||(sex==='random'&&Math.random()>0.5)
  const first=isMale?FIRST_M[Math.floor(Math.random()*FIRST_M.length)]:FIRST_F[Math.floor(Math.random()*FIRST_F.length)]
  const last=LAST[Math.floor(Math.random()*LAST.length)]
  const m=middle?' '+MIDDLE[Math.floor(Math.random()*MIDDLE.length)]+'.':''
  return first+m+' '+last
}
function genFantasy():string{
  return FANTASY_FIRST[Math.floor(Math.random()*FANTASY_FIRST.length)]+' '+FANTASY_LAST[Math.floor(Math.random()*FANTASY_LAST.length)]
}
function genBusiness():string{
  const a=BUSINESS[Math.floor(Math.random()*BUSINESS.length)]
  const b=BUSINESS_SUFFIX[Math.floor(Math.random()*BUSINESS_SUFFIX.length)]
  return a+' '+b
}


const tool = getToolBySlug('random-name-generator')!

export default function RandomNameGeneratorPage() {
  const [type,setType]=useState<GenType>('realistic')
  const [sex,setSex]=useState<'male'|'female'|'random'>('random')
  const [middle,setMiddle]=useState(false)
  const [count,setCount]=useState(10)
  const [names,setNames]=useState<string[]>([])
  const [copied,setCopied]=useState(false)

  function generate(){
    const list=Array.from({length:count},()=>
      type==='realistic'?genRealistic(sex,middle):type==='fantasy'?genFantasy():genBusiness()
    )
    setNames(list)
  }

  function copy(){navigator.clipboard.writeText(names.join('\n'));setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Random Name Generator</h1>
        <p className="text-gray-500 mb-8">Generate realistic names, fantasy character names, or business names instantly</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            {([['realistic','Realistic'],['fantasy','Fantasy'],['business','Business']] as [GenType,string][]).map(([t,l])=>(
              <button key={t} onClick={()=>setType(t)} className={'flex-1 py-2 text-sm rounded-lg font-medium transition-colors '+(type===t?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{l}</button>
            ))}
          </div>
          {type==='realistic'&&(
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-1">
                {(['random','male','female'] as const).map(s=>(
                  <button key={s} onClick={()=>setSex(s)} className={'px-3 py-1.5 text-sm rounded-lg capitalize font-medium transition-colors '+(sex===s?'bg-purple-500 text-white':'bg-gray-100 text-gray-700')}>{s}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={middle} onChange={e=>setMiddle(e.target.checked)} className="rounded" />
                <span className="text-sm">Middle initial</span>
              </label>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Count</label>
            <input type="range" min={1} max={50} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="flex-1" />
            <span className="text-brand-600 font-bold w-6 text-right">{count}</span>
          </div>
          <button onClick={generate} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            Generate Names
          </button>
        </div>
        {names.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800">{names.length} names generated</span>
              <div className="flex gap-2">
                <button onClick={generate} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">Regenerate</button>
                <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy All'}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {names.map((n,i)=>(
                <div key={i} className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">{n}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}