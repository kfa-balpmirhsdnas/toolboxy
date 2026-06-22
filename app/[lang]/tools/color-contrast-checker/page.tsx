'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return null
  const full = clean.length === 3 ? clean.split('').map(c => c+c).join('') : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

function contrastRatio(rgb1: [number,number,number], rgb2: [number,number,number]): number {
  const l1 = relativeLuminance(...rgb1)
  const l2 = relativeLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}


const tool = getToolBySlug('color-contrast-checker')!

export default function ColorContrastCheckerPage() {
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')

  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null

  const wcagAA = ratio !== null ? ratio >= 4.5 : false
  const wcagAALarge = ratio !== null ? ratio >= 3 : false
  const wcagAAA = ratio !== null ? ratio >= 7 : false

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Contrast Checker</h1>
        <p className="text-gray-500 mb-8">Check if your color combinations meet WCAG accessibility standards.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color</label>
              <div className="flex gap-2">
                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="h-10 w-12 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={fg} onChange={e => setFg(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-10 w-12 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={bg} onChange={e => setBg(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="rounded-xl p-8 text-center" style={{background: bg, color: fg}}>
            <p className="text-2xl font-bold">Sample Text</p>
            <p className="text-sm mt-2">The quick brown fox jumps over the lazy dog</p>
            <p className="text-xs mt-1">Small text at 12px</p>
          </div>

          {ratio !== null && (
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-5xl font-bold text-gray-900">{ratio.toFixed(2)}</span>
                <span className="text-gray-400 text-lg">:1</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'AA Normal', pass: wcagAA, req: '4.5:1' },
                  { label: 'AA Large', pass: wcagAALarge, req: '3:1' },
                  { label: 'AAA Normal', pass: wcagAAA, req: '7:1' },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-lg text-center ${item.pass ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`text-lg font-bold ${item.pass ? 'text-green-600' : 'text-red-500'}`}>{item.pass ? 'Pass' : 'Fail'}</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">{item.label}</div>
                    <div className="text-xs text-gray-400">(min {item.req})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
