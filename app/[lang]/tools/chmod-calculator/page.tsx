'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('chmod-calculator')!

type Perm = { read: boolean; write: boolean; execute: boolean }
type PermSet = { owner: Perm; group: Perm; others: Perm }

function permToOctal(p: Perm): number {
  return (p.read?4:0)+(p.write?2:0)+(p.execute?1:0)
}
function octalToPerm(n: number): Perm {
  return { read:!!(n&4), write:!!(n&2), execute:!!(n&1) }
}
function permToSymbol(p: Perm): string {
  return (p.read?'r':'-')+(p.write?'w':'-')+(p.execute?'x':'-')
}

export default function ChmodCalculatorPage({ params }: { params: { lang: string } }) {
  const [perms, setPerms] = useState<PermSet>({
    owner:{ read:true, write:true, execute:false },
    group:{ read:true, write:false, execute:false },
    others:{ read:true, write:false, execute:false },
  })
  const [octalInput, setOctalInput] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('chmod-calculator'); tracked.current = true } }

  function togglePerm(who: keyof PermSet, bit: keyof Perm) {
    setPerms(p=>({...p,[who]:{...p[who],[bit]:!p[who][bit]}})); track()
  }

  function applyOctal(val: string) {
    setOctalInput(val)
    if (/^[0-7]{3}$/.test(val)) {
      setPerms({
        owner: octalToPerm(parseInt(val[0])),
        group: octalToPerm(parseInt(val[1])),
        others: octalToPerm(parseInt(val[2])),
      }); track()
    }
  }

  const o = permToOctal(perms.owner), g = permToOctal(perms.group), ot = permToOctal(perms.others)
  const octal = String(o)+String(g)+String(ot)
  const symbolic = '-'+permToSymbol(perms.owner)+permToSymbol(perms.group)+permToSymbol(perms.others)
  const chmod = 'chmod '+octal+' filename'

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('chmod-calculator')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const WHOS: (keyof PermSet)[] = ['owner','group','others']
  const BITS: (keyof Perm)[] = ['read','write','execute']

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {WHOS.map(who=>(
            <div key={who} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-semibold text-gray-700 mb-2 capitalize">{who}</p>
              {BITS.map(bit=>(
                <label key={bit} className="flex items-center gap-2 cursor-pointer text-sm mb-1">
                  <input type="checkbox" checked={perms[who][bit]} onChange={()=>togglePerm(who,bit)} className="accent-brand-600" />
                  <span className="capitalize text-xs">{bit}</span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{bit==='read'?4:bit==='write'?2:1}</span>
                </label>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-200 text-center font-mono text-xl font-bold text-brand-600">{permToOctal(perms[who])}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Octal input:</label>
          <input value={octalInput} onChange={e=>applyOctal(e.target.value)} placeholder="e.g. 644" maxLength={3}
            className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Octal', val:octal },
            { label:'Symbolic', val:symbolic },
            { label:'chmod command', val:chmod },
            { label:'Numeric', val:parseInt(octal,8).toString() },
          ].map(row=>(
            <div key={row.label} onClick={()=>copy(row.val,row.label)} className="p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors">
              <p className="text-xs text-gray-500">{row.label}</p>
              <p className="text-sm font-mono text-gray-800 mt-0.5">{row.val}</p>
              {copied===row.label && <p className="text-xs text-brand-400">\u2713</p>}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
