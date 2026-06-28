// Refresh public/data/powerball.json from NY State Open Data (dataset d6yy-54nr).
// Runs at build time (wired into the "build" script) so every Vercel deploy ships a
// fresh fallback snapshot, and can also be run manually:  node scripts/fetch-powerball.mjs
//
// Non-fatal by design: any failure (source down, blocked, malformed, too few rows) is
// caught, the build is NEVER broken, and the existing committed snapshot is kept rather
// than clobbered. The live tool fetches the source directly; this snapshot is the fallback.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'

const API = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=5000&$order=draw_date%20DESC'
const OUT = 'public/data/powerball.json'
const CUR_START = '2015-10-07' // current matrix (5× 1–69 + Powerball 1–26) begins

async function main() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000) // never hang the build
  let raw
  try {
    const res = await fetch(API, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    raw = await res.json()
  } finally {
    clearTimeout(timer)
  }
  if (!Array.isArray(raw) || raw.length < 1000) throw new Error(`unexpected payload (${raw?.length} rows)`)

  const draws = []
  for (const r of raw) {
    const nums = (r.winning_numbers || '').trim().split(/\s+/).map(Number)
    const date = (r.draw_date || '').slice(0, 10)
    const white = nums.slice(0, 5)
    const pb = nums[5]
    const pp = r.multiplier != null && r.multiplier !== '' ? parseInt(r.multiplier, 10) : null
    const era = date >= CUR_START ? 'current' : 'legacy'
    const wMax = era === 'current' ? 69 : 59
    const pMax = era === 'current' ? 26 : 39
    const ok =
      nums.length === 6 && white.length === 5 && white.every((n) => n >= 1 && n <= wMax) &&
      new Set(white).size === 5 && pb >= 1 && pb <= pMax
    if (!ok) continue // skip a malformed row, keep the rest
    draws.push({ date, white, pb, pp, era })
  }
  // Guard: refuse to overwrite a good snapshot with a suspiciously small/broken payload.
  if (draws.length < 1000) throw new Error(`too few valid draws (${draws.length})`)

  const out = {
    source: 'NY State Open Data — Lottery Powerball Winning Numbers: Beginning 2010 (d6yy-54nr)',
    source_url: 'https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr',
    api: 'https://data.ny.gov/resource/d6yy-54nr.json',
    license: 'NY Open Data Terms of Use — public, free, programmatic reuse permitted; data provided as is',
    note: 'Current matrix (5× 1–69 + Powerball 1–26) since 2015-10-07. Use era=current for stats.',
    collected_at: new Date().toISOString(),
    count: draws.length,
    count_current: draws.filter((d) => d.era === 'current').length,
    count_legacy: draws.filter((d) => d.era === 'legacy').length,
    latest_draw: draws[0]?.date,
    earliest_draw: draws[draws.length - 1]?.date,
    draws,
  }
  mkdirSync('public/data', { recursive: true })
  writeFileSync(OUT, JSON.stringify(out))
  console.log(`[powerball] snapshot updated: ${out.count} draws (current ${out.count_current}), latest ${out.latest_draw}`)
}

main().catch((e) => {
  const had = existsSync(OUT)
  console.warn(`[powerball] refresh skipped: ${e.message}. ${had ? 'Keeping existing snapshot.' : 'WARNING: no snapshot present!'}`)
  process.exit(0) // non-fatal — never break the build
})
