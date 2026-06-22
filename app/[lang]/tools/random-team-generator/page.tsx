'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const TEAM_COLORS=['bg-red-100 border-red-200','bg-blue-100 border-blue-200','bg-green-100 border-green-200','bg-yellow-100 border-yellow-200','bg-purple-100 border-purple-200','bg-pink-100 border-pink-200','bg-orange-100 border-orange-200','bg-teal-100 border-teal-200']


const tool = getToolBySlug('random-team-generator')!

export default function RandomTeamGeneratorPage() {
  const [names,setNames]=useState('Alice\nBob\nCharlie\nDave\nEve\nFrank\nGrace\nHank')
  const [teamCount,setTeamCount]=useState(2)
  const [teams,setTeams]=useState<string[][]>([])
  const [copied,setCopied]=useState(false)

  function generate(){
    const list=names.split('\n').map(n=>n.trim()).filter(Boolean)
    const shuffled=[...list].sort(()=>Math.random()-0.5)
    const result:string[][]=Array.from({length:teamCount},()=>[])
    shuffled.forEach((name,i)=>result[i%teamCount].push(name))
    setTeams(result)
  }

  function copyAll(){
    const text=teams.map((t,i)=>'Team '+(i+1)+':\n'+t.join('\n')).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true);setTimeout(()=>setCopied(false),2000)
  }

  const nameCount=names.split('\n').filter(n=>n.trim()).length

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Random Team Generator</h1>
        <p className="text-gray-500 mb-8">Split any list of people into random, balanced teams instantly</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Names (one per line)</label>
            <textarea value={names} onChange={e=>setNames(e.target.value)} rows={8}
              placeholder="Alice\nBob\nCharlie..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">{nameCount} people entered</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Number of teams</label>
            <input type="range" min={2} max={Math.min(nameCount,10)||10} value={teamCount} onChange={e=>setTeamCount(parseInt(e.target.value))} className="flex-1" />
            <span className="text-brand-600 font-bold w-6 text-right">{teamCount}</span>
          </div>
          <button onClick={generate} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            Generate Teams
          </button>
        </div>
        {teams.length>0&&(
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Teams</h2>
              <div className="flex gap-2">
                <button onClick={generate} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">Reshuffle</button>
                <button onClick={copyAll} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy All'}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((team,i)=>(
                <div key={i} className={'rounded-xl border p-4 '+TEAM_COLORS[i%TEAM_COLORS.length]}>
                  <h3 className="font-semibold text-gray-700 mb-2">Team {i+1} <span className="text-xs font-normal text-gray-400">({team.length} members)</span></h3>
                  <ul className="space-y-1">
                    {team.map(name=>(<li key={name} className="text-sm text-gray-700">\u2022 {name}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}