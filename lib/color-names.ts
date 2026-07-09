// Standard CSS/HTML named colors + color math, shared by the html-color-names tool,
// the per-color longtail pages and color-to-tailwind (single source — never fork).

export interface CssColor { name: string; hex: string }

export const CSS_COLORS: CssColor[] = ([
  ['AliceBlue', '#F0F8FF'], ['AntiqueWhite', '#FAEBD7'], ['Aqua', '#00FFFF'], ['Aquamarine', '#7FFFD4'],
  ['Azure', '#F0FFFF'], ['Beige', '#F5F5DC'], ['Bisque', '#FFE4C4'], ['Black', '#000000'],
  ['BlanchedAlmond', '#FFEBCD'], ['Blue', '#0000FF'], ['BlueViolet', '#8A2BE2'], ['Brown', '#A52A2A'],
  ['BurlyWood', '#DEB887'], ['CadetBlue', '#5F9EA0'], ['Chartreuse', '#7FFF00'], ['Chocolate', '#D2691E'],
  ['Coral', '#FF7F50'], ['CornflowerBlue', '#6495ED'], ['Cornsilk', '#FFF8DC'], ['Crimson', '#DC143C'],
  ['Cyan', '#00FFFF'], ['DarkBlue', '#00008B'], ['DarkCyan', '#008B8B'], ['DarkGoldenRod', '#B8860B'],
  ['DarkGray', '#A9A9A9'], ['DarkGreen', '#006400'], ['DarkKhaki', '#BDB76B'], ['DarkMagenta', '#8B008B'],
  ['DarkOliveGreen', '#556B2F'], ['DarkOrange', '#FF8C00'], ['DarkOrchid', '#9932CC'], ['DarkRed', '#8B0000'],
  ['DarkSalmon', '#E9967A'], ['DarkSeaGreen', '#8FBC8F'], ['DarkSlateBlue', '#483D8B'], ['DarkSlateGray', '#2F4F4F'],
  ['DarkTurquoise', '#00CED1'], ['DarkViolet', '#9400D3'], ['DeepPink', '#FF1493'], ['DeepSkyBlue', '#00BFFF'],
  ['DimGray', '#696969'], ['DodgerBlue', '#1E90FF'], ['FireBrick', '#B22222'], ['FloralWhite', '#FFFAF0'],
  ['ForestGreen', '#228B22'], ['Fuchsia', '#FF00FF'], ['Gainsboro', '#DCDCDC'], ['GhostWhite', '#F8F8FF'],
  ['Gold', '#FFD700'], ['GoldenRod', '#DAA520'], ['Gray', '#808080'], ['Green', '#008000'],
  ['GreenYellow', '#ADFF2F'], ['HoneyDew', '#F0FFF0'], ['HotPink', '#FF69B4'], ['IndianRed', '#CD5C5C'],
  ['Indigo', '#4B0082'], ['Ivory', '#FFFFF0'], ['Khaki', '#F0E68C'], ['Lavender', '#E6E6FA'],
  ['LavenderBlush', '#FFF0F5'], ['LawnGreen', '#7CFC00'], ['LemonChiffon', '#FFFACD'], ['LightBlue', '#ADD8E6'],
  ['LightCoral', '#F08080'], ['LightCyan', '#E0FFFF'], ['LightGoldenRodYellow', '#FAFAD2'], ['LightGray', '#D3D3D3'],
  ['LightGreen', '#90EE90'], ['LightPink', '#FFB6C1'], ['LightSalmon', '#FFA07A'], ['LightSeaGreen', '#20B2AA'],
  ['LightSkyBlue', '#87CEFA'], ['LightSlateGray', '#778899'], ['LightSteelBlue', '#B0C4DE'], ['LightYellow', '#FFFFE0'],
  ['Lime', '#00FF00'], ['LimeGreen', '#32CD32'], ['Linen', '#FAF0E6'], ['Magenta', '#FF00FF'],
  ['Maroon', '#800000'], ['MediumAquaMarine', '#66CDAA'], ['MediumBlue', '#0000CD'], ['MediumOrchid', '#BA55D3'],
  ['MediumPurple', '#9370DB'], ['MediumSeaGreen', '#3CB371'], ['MediumSlateBlue', '#7B68EE'], ['MediumSpringGreen', '#00FA9A'],
  ['MediumTurquoise', '#48D1CC'], ['MediumVioletRed', '#C71585'], ['MidnightBlue', '#191970'], ['MintCream', '#F5FFFA'],
  ['MistyRose', '#FFE4E1'], ['Moccasin', '#FFE4B5'], ['NavajoWhite', '#FFDEAD'], ['Navy', '#000080'],
  ['OldLace', '#FDF5E6'], ['Olive', '#808000'], ['OliveDrab', '#6B8E23'], ['Orange', '#FFA500'],
  ['OrangeRed', '#FF4500'], ['Orchid', '#DA70D6'], ['PaleGoldenRod', '#EEE8AA'], ['PaleGreen', '#98FB98'],
  ['PaleTurquoise', '#AFEEEE'], ['PaleVioletRed', '#DB7093'], ['PapayaWhip', '#FFEFD5'], ['PeachPuff', '#FFDAB9'],
  ['Peru', '#CD853F'], ['Pink', '#FFC0CB'], ['Plum', '#DDA0DD'], ['PowderBlue', '#B0E0E6'],
  ['Purple', '#800080'], ['Red', '#FF0000'], ['RosyBrown', '#BC8F8F'], ['RoyalBlue', '#4169E1'],
  ['SaddleBrown', '#8B4513'], ['Salmon', '#FA8072'], ['SandyBrown', '#F4A460'], ['SeaGreen', '#2E8B57'],
  ['SeaShell', '#FFF5EE'], ['Sienna', '#A0522D'], ['Silver', '#C0C0C0'], ['SkyBlue', '#87CEEB'],
  ['SlateBlue', '#6A5ACD'], ['SlateGray', '#708090'], ['Snow', '#FFFAFA'], ['SpringGreen', '#00FF7F'],
  ['SteelBlue', '#4682B4'], ['Tan', '#D2B48C'], ['Teal', '#008080'], ['Thistle', '#D8BFD8'],
  ['Tomato', '#FF6347'], ['Turquoise', '#40E0D0'], ['Violet', '#EE82EE'], ['Wheat', '#F5DEB3'],
  ['White', '#FFFFFF'], ['WhiteSmoke', '#F5F5F5'], ['Yellow', '#FFFF00'], ['YellowGreen', '#9ACD32'],
] as [string, string][]).map(([name, hex]) => ({ name, hex }))

export const colorSlug = (c: CssColor): string => c.name.toLowerCase()
export const COLOR_BY_SLUG: Record<string, CssColor> = Object.fromEntries(CSS_COLORS.map((c) => [colorSlug(c), c]))

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b); const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const dist = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)

/** Nearest named colors by RGB distance (self and exact duplicates excluded). */
export function similarColors(hex: string, count = 8): CssColor[] {
  const rgb = hexToRgb(hex)
  return CSS_COLORS
    .filter((c) => c.hex.toLowerCase() !== hex.toLowerCase())
    .map((c) => ({ c, d: dist(rgb, hexToRgb(c.hex)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.c)
}

// Tailwind CSS default palette (selected shades) — also used by the color-to-tailwind tool.
export const TW_PALETTE: { name: string; hex: string }[] = [
  { name: 'slate-50', hex: '#f8fafc' }, { name: 'slate-100', hex: '#f1f5f9' }, { name: 'slate-200', hex: '#e2e8f0' }, { name: 'slate-300', hex: '#cbd5e1' }, { name: 'slate-400', hex: '#94a3b8' }, { name: 'slate-500', hex: '#64748b' }, { name: 'slate-600', hex: '#475569' }, { name: 'slate-700', hex: '#334155' }, { name: 'slate-800', hex: '#1e293b' }, { name: 'slate-900', hex: '#0f172a' },
  { name: 'gray-50', hex: '#f9fafb' }, { name: 'gray-100', hex: '#f3f4f6' }, { name: 'gray-200', hex: '#e5e7eb' }, { name: 'gray-300', hex: '#d1d5db' }, { name: 'gray-400', hex: '#9ca3af' }, { name: 'gray-500', hex: '#6b7280' }, { name: 'gray-600', hex: '#4b5563' }, { name: 'gray-700', hex: '#374151' }, { name: 'gray-800', hex: '#1f2937' }, { name: 'gray-900', hex: '#111827' },
  { name: 'red-50', hex: '#fef2f2' }, { name: 'red-100', hex: '#fee2e2' }, { name: 'red-200', hex: '#fecaca' }, { name: 'red-400', hex: '#f87171' }, { name: 'red-500', hex: '#ef4444' }, { name: 'red-600', hex: '#dc2626' }, { name: 'red-700', hex: '#b91c1c' }, { name: 'red-900', hex: '#7f1d1d' },
  { name: 'orange-400', hex: '#fb923c' }, { name: 'orange-500', hex: '#f97316' }, { name: 'orange-600', hex: '#ea580c' }, { name: 'orange-700', hex: '#c2410c' },
  { name: 'amber-400', hex: '#fbbf24' }, { name: 'amber-500', hex: '#f59e0b' }, { name: 'amber-600', hex: '#d97706' },
  { name: 'yellow-300', hex: '#fde047' }, { name: 'yellow-400', hex: '#facc15' }, { name: 'yellow-500', hex: '#eab308' },
  { name: 'green-50', hex: '#f0fdf4' }, { name: 'green-100', hex: '#dcfce7' }, { name: 'green-400', hex: '#4ade80' }, { name: 'green-500', hex: '#22c55e' }, { name: 'green-600', hex: '#16a34a' }, { name: 'green-700', hex: '#15803d' }, { name: 'green-900', hex: '#14532d' },
  { name: 'teal-400', hex: '#2dd4bf' }, { name: 'teal-500', hex: '#14b8a6' }, { name: 'teal-600', hex: '#0d9488' },
  { name: 'cyan-400', hex: '#22d3ee' }, { name: 'cyan-500', hex: '#06b6d4' }, { name: 'cyan-600', hex: '#0891b2' },
  { name: 'blue-50', hex: '#eff6ff' }, { name: 'blue-100', hex: '#dbeafe' }, { name: 'blue-400', hex: '#60a5fa' }, { name: 'blue-500', hex: '#3b82f6' }, { name: 'blue-600', hex: '#2563eb' }, { name: 'blue-700', hex: '#1d4ed8' }, { name: 'blue-900', hex: '#1e3a8a' },
  { name: 'indigo-400', hex: '#818cf8' }, { name: 'indigo-500', hex: '#6366f1' }, { name: 'indigo-600', hex: '#4f46e5' }, { name: 'indigo-700', hex: '#4338ca' },
  { name: 'violet-500', hex: '#8b5cf6' }, { name: 'violet-600', hex: '#7c3aed' }, { name: 'violet-700', hex: '#6d28d9' },
  { name: 'purple-400', hex: '#c084fc' }, { name: 'purple-500', hex: '#a855f7' }, { name: 'purple-600', hex: '#9333ea' },
  { name: 'pink-400', hex: '#f472b6' }, { name: 'pink-500', hex: '#ec4899' }, { name: 'pink-600', hex: '#db2777' },
  { name: 'rose-400', hex: '#fb7185' }, { name: 'rose-500', hex: '#f43f5e' }, { name: 'rose-600', hex: '#e11d48' },
  { name: 'white', hex: '#ffffff' }, { name: 'black', hex: '#000000' },
]

/** Closest Tailwind palette entries by RGB distance. */
export function nearestTailwind(hex: string, count = 3): { name: string; hex: string }[] {
  const rgb = hexToRgb(hex)
  return TW_PALETTE
    .map((c) => ({ c, d: dist(rgb, hexToRgb(c.hex)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.c)
}
