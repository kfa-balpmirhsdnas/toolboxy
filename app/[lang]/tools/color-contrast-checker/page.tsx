'use client'
import { useState } from 'react'

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    return { r: parseInt(clean[0]+clean[0],16), g: parseInt(clean[1]+clean[1],16), b: parseInt(clean[2]+clean[2],16) }
  }
  if (clean.length === 6) {
    return { r: parseInt(clean.slice(0,2),16), g: parseInt(clean.slice(2,4),16), b: parseInt(clean.slice(4,6),16) }
  }
  return null
}

function luminance(r, g, b) {
  const toLinear = (c) => { const s = c/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4) }
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b)
}

function contrastRatio(c1, c2) {
  const l1 = luminance(c1.r,c1.g,c1.b), l2 = luminance(c2.r,c2.g,c2.b)
  return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)
}

export default function ColorContrastChecker() {
  const [fg, setFg] = useState('#1a1a1a')
  const [bg, setBg] = useState('#ffffff')
  const fgRgb = hexToRgb(fg), bgRgb = hexToRgb(bg)
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : 0
  const Badge = ({ pass }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {pass ? 'Pass' : 'Fail'}
    </span>
  )
  const presets = [
    { name: 'Black/White', fg: '#000000', bg: '#ffffff' },
    { name: 'Dark mode', fg: '#e5e7eb', bg: '#1f2937' },
    { name: 'Blue link', fg: '#1d4ed8', bg: '#ffffff' },
    { name: 'Error red', fg: '#dc2626', bg: '#ffffff' },
    { name: 'Muted', fg: '#6b7280', bg: '#ffffff' },
    { name: 'Warning', fg: '#92400e', bg: '#fef3c7' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Contrast Checker</h1>
        <p className="text-gray-500 mb-8">Check WCAG 2.1 color contrast ratios for accessibility compliance.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-6 items-center flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foreground (Text)</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-14 h-10 rounded cursor-pointer border border-gray-300"/>
                <input type="text" value={fg} onChange={e=>setFg(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase"/>
              </div>
            </div>
            <button onClick={()=>{setFg(bg);setBg(fg)}} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors mt-5">⇄ Swap</button>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-14 h-10 rounded cursor-pointer border border-gray-300"/>
                <input type="text" value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase"/>
              </div>
            </div>
          </div>
        </div>
        {ratio > 0 && (
          <>
            <div className="rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 text-center" style={{backgroundColor:bg,color:fg}}>
              <p className="text-2xl font-bold mb-2">The quick brown fox</p>
              <p className="text-base mb-1">Normal text sample (16px)</p>
              <p className="text-sm">Small text sample (14px)</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
              <div className="text-5xl font-black text-gray-900 mb-1">{ratio.toFixed(2)}<span className="text-2xl font-normal text-gray-400">:1</span></div>
              <div className="text-sm text-gray-500">Contrast Ratio</div>
              <div className={`mt-3 text-lg font-bold ${ratio>=4.5?'text-green-600':ratio>=3?'text-yellow-600':'text-red-600'}`}>
                {ratio>=4.5?'✓ Good':ratio>=3?'⚠ Large text only':'✗ Insufficient'}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Use Case</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">AA</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">AAA</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-5 py-3 text-gray-700">Normal text</td><td className="text-center px-4 py-3"><Badge pass={ratio>=4.5}/></td><td className="text-center px-4 py-3"><Badge pass={ratio>=7}/></td></tr>
                  <tr><td className="px-5 py-3 text-gray-700">Large text</td><td className="text-center px-4 py-3"><Badge pass={ratio>=3}/></td><td className="text-center px-4 py-3"><Badge pass={ratio>=4.5}/></td></tr>
                  <tr><td className="px-5 py-3 text-gray-700">UI components</td><td className="text-center px-4 py-3"><Badge pass={ratio>=3}/></td><td className="text-center px-4 py-3 text-gray-400 text-xs">N/A</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Common Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presets.map(p=>(
                  <button key={p.name} onClick={()=>{setFg(p.fg);setBg(p.bg)}} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">{p.name}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}