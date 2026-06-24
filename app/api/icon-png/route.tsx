import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

/**
 * Brand app icon as a real PNG (Android's WebAPK can't use SVG icons, so an
 * SVG-only manifest falls back to a generic Chrome icon). Pure shapes — the
 * brand "T" — so no font is needed. ?s= sets the square size (default 512).
 */
export function GET(req: NextRequest) {
  const s = Math.min(1024, Math.max(48, Number(req.nextUrl.searchParams.get('s')) || 512))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0284c7', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '25%', top: '29%', width: '50%', height: '12.5%', background: '#ffffff', borderRadius: 14 }} />
        <div style={{ position: 'absolute', left: '43.75%', top: '29%', width: '12.5%', height: '45%', background: '#ffffff', borderRadius: 14 }} />
      </div>
    ),
    { width: s, height: s },
  )
}
