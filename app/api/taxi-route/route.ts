// 택시 거리·경로 프록시 — OpenRouteService (지오코딩 + 디렉션) 키 은닉용 서버리스.
// 요금은 반환하지 않는다: 클라이언트가 lib/tools/taxiFare.ts로 계산 (taxi2.md §4).
// ORS 좌표는 [lng, lat] — Leaflet용 geometry만 [lat, lng]로 뒤집어 내려보낸다.

import { NextRequest, NextResponse } from 'next/server'

const ORS = 'https://api.openrouteservice.org'

// 동일 요청 캐시 (서버리스 인스턴스 수명 동안) — 무료 쿼터 절약 (taxi2.md §10-4)
const cache = new Map<string, { at: number; data: unknown }>()
const CACHE_TTL = 1000 * 60 * 60 * 6
const CACHE_MAX = 500

interface GeoPoint { lat: number; lng: number; label: string }

async function geocode(key: string, text: string, country: string): Promise<GeoPoint | null> {
  const url = `${ORS}/geocode/search?api_key=${key}&text=${encodeURIComponent(text)}&boundary.country=${country}&size=1`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`geocode ${r.status}`)
  const j = await r.json()
  const f = j.features?.[0]
  if (!f) return null
  const [lng, lat] = f.geometry.coordinates // ORS = [lng, lat]
  return { lng, lat, label: f.properties?.label || text }
}

export async function POST(req: NextRequest) {
  const key = process.env.ORS_API_KEY
  if (!key) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 })

  let body: { origin?: string; destination?: string; country?: string; withGeometry?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 }) }
  const origin = String(body.origin || '').trim().slice(0, 200)
  const destination = String(body.destination || '').trim().slice(0, 200)
  const country = body.country === 'JP' ? 'JP' : body.country === 'KR' ? 'KR' : null
  const withGeometry = !!body.withGeometry
  if (!origin || !destination || !country) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 })

  const cacheKey = `${country}|${withGeometry ? 1 : 0}|${origin}|${destination}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL) return NextResponse.json(hit.data)

  try {
    const [o, d] = await Promise.all([geocode(key, origin, country), geocode(key, destination, country)])
    if (!o) return NextResponse.json({ error: 'ORIGIN_NOT_FOUND' }, { status: 422 })
    if (!d) return NextResponse.json({ error: 'DEST_NOT_FOUND' }, { status: 422 })

    const dirRes = await fetch(`${ORS}/v2/directions/driving-car/geojson`, {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: [[o.lng, o.lat], [d.lng, d.lat]] }),
    })
    if (!dirRes.ok) {
      if (dirRes.status === 404 || dirRes.status === 400) return NextResponse.json({ error: 'ROUTE_NOT_FOUND' }, { status: 422 })
      throw new Error(`directions ${dirRes.status}`)
    }
    const geo = await dirRes.json()
    const feat = geo.features?.[0]
    const summary = feat?.properties?.summary
    if (!summary) return NextResponse.json({ error: 'ROUTE_NOT_FOUND' }, { status: 422 })

    const data = {
      origin: o,
      destination: d,
      distanceM: Math.round(summary.distance),
      durationSec: Math.round(summary.duration),
      geometry: withGeometry
        ? (feat.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng])
        : undefined,
    }
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!)
    cache.set(cacheKey, { at: Date.now(), data })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 })
  }
}
