import { NextRequest } from 'next/server'

// 1–4 letters/digits/arrows only — keeps the label safe to inline into SVG.
const SAFE_LABEL = /^[\p{L}\p{N}↔→←]{1,4}$/u

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Per-tool app icon: the brand rounded square with a short label (e.g. "한일",
 * "영한", "일↔") so each installed dictionary app is distinguishable on the home
 * screen. Falls back to "Tb" for anything without a valid label.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('label') || 'Tb'
  const label = SAFE_LABEL.test(raw) ? raw : 'Tb'
  const len = [...label].length
  const fontSize = len <= 1 ? 300 : len === 2 ? 208 : len === 3 ? 150 : 116
  const fonts = '\'Apple SD Gothic Neo\',\'Noto Sans KR\',\'Noto Sans JP\',\'Malgun Gothic\',\'Hiragino Sans\',\'Yu Gothic\',sans-serif'
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
    `<rect width="512" height="512" rx="96" fill="#0284c7"/>` +
    `<text x="256" y="256" fill="#ffffff" font-family="${fonts}" font-size="${fontSize}" font-weight="700" ` +
    `text-anchor="middle" dominant-baseline="central">${esc(label)}</text></svg>`
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
}
