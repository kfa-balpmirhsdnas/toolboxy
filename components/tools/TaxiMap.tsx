'use client'
// 택시 경로 지도 (B형 전용) — Leaflet + OSM 타일. B형 페이지에서 next/dynamic(ssr:false)으로만
// 로드되므로 A형·다른 도구 번들에는 포함되지 않는다. 마커는 이미지 에셋 이슈를 피해 circleMarker.
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { TaxiRouteData } from './TaxiFareTool'

export default function TaxiMap({ data }: { data: TaxiRouteData }) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    let disposed = false
    ;(async () => {
      const L = (await import('leaflet')).default
      if (disposed || !divRef.current || !data.geometry) return
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      const map = L.map(divRef.current, { scrollWheelZoom: false })
      mapRef.current = map
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      const line = L.polyline(data.geometry as [number, number][], { color: '#2563eb', weight: 5, opacity: 0.85 }).addTo(map)
      L.circleMarker([data.origin.lat, data.origin.lng], { radius: 8, color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1 })
        .addTo(map).bindPopup(data.origin.label)
      L.circleMarker([data.destination.lat, data.destination.lng], { radius: 8, color: '#dc2626', fillColor: '#ef4444', fillOpacity: 1 })
        .addTo(map).bindPopup(data.destination.label)
      map.fitBounds(line.getBounds(), { padding: [24, 24] })
    })()
    return () => { disposed = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [data])

  return <div ref={divRef} className="w-full h-72 md:h-80 rounded-xl border border-gray-200 overflow-hidden" />
}
