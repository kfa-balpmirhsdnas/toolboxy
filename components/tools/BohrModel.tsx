// Pure-SVG Bohr model (electron shell diagram). No external libraries.
// Draws a nucleus (symbol + atomic number) ringed by one orbit per electron
// shell, with that shell's electrons placed as evenly-spaced dots. Orbit radii
// scale to fit the viewBox and dot sizes shrink for crowded shells so they never
// overlap; the per-shell counts are also printed below as numbers.

export default function BohrModel({
  shells, color, symbol, number, size = 200,
}: { shells: number[]; color: string; symbol: string; number: number; size?: number }) {
  const c = size / 2
  const nucleusR = Math.max(15, size * 0.085)
  const n = shells.length || 1
  const maxR = size / 2 - size * 0.045
  const step = (maxR - nucleusR) / n

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img"
        aria-label={`Bohr model: ${symbol}, shells ${shells.join(', ')}`} className="max-w-full">
        {shells.map((count, i) => {
          const r = nucleusR + step * (i + 1)
          const circ = 2 * Math.PI * r
          // shrink dots on crowded shells so they keep clear of each other
          const dotR = Math.max(1.3, Math.min(size * 0.018, (circ / Math.max(count, 1)) * 0.3))
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={1} />
              {Array.from({ length: count }).map((_, j) => {
                const a = (-90 + (360 / count) * j) * (Math.PI / 180)
                return <circle key={j} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={dotR} fill="#1f2937" />
              })}
            </g>
          )
        })}
        {/* nucleus */}
        <circle cx={c} cy={c} r={nucleusR} fill={color} stroke="#fff" strokeWidth={1.5} />
        <text x={c} y={c - nucleusR * 0.12} textAnchor="middle" dominantBaseline="middle"
          fontSize={nucleusR * 0.82} fontWeight={800} fill="#111827">{symbol}</text>
        <text x={c} y={c + nucleusR * 0.55} textAnchor="middle" dominantBaseline="middle"
          fontSize={nucleusR * 0.4} fontWeight={600} fill="#374151">{number}</text>
      </svg>
      {/* per-shell electron counts as numbers (always shown; essential when dots get dense) */}
      <div className="mt-1 text-xs font-medium text-gray-600 tabular-nums">{shells.join(' · ')}</div>
    </div>
  )
}
