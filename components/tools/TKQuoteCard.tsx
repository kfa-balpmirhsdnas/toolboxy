'use client'

// 명언 카드 이미지 저장 — 1080×1080 canvas (인물 테스트 카드와 같은 방식의 텍스트 카드).
export default function TKQuoteCard({ hanmun, trans, person, hanja, color, label }: {
  hanmun: string
  trans: string
  person: string   // localized person name
  hanja: string    // person hanja
  color: string
  label: string
}) {
  function wrap(x: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const out: string[] = []
    let line = ''
    for (const word of text.split(/(\s+)/)) {
      if (x.measureText(line + word).width > maxW && line.trim()) { out.push(line.trim()); line = word.trimStart() }
      else line += word
    }
    if (line.trim()) out.push(line.trim())
    return out
  }

  function save() {
    const S = 1080
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const x = cv.getContext('2d')!
    x.fillStyle = '#111827'; x.fillRect(0, 0, S, S)
    x.fillStyle = color; x.fillRect(0, 0, S, 14)
    x.textAlign = 'center'
    // opening quote mark
    x.fillStyle = color; x.font = 'bold 120px serif'; x.fillText('“', S / 2, 190)
    // hanmun (wrap by characters — no spaces in classical Chinese)
    x.fillStyle = '#ffffff'; x.font = 'bold 72px serif'
    const chars = hanmun.split('')
    const hanLines: string[] = []
    let cur = ''
    for (const ch of chars) {
      if (x.measureText(cur + ch).width > 880) { hanLines.push(cur); cur = ch } else cur += ch
    }
    if (cur) hanLines.push(cur)
    let y = 320
    for (const l of hanLines.slice(0, 4)) { x.fillText(l, S / 2, y); y += 96 }
    // translation
    x.fillStyle = '#d1d5db'; x.font = '34px sans-serif'
    y += 30
    for (const l of wrap(x, trans, 900).slice(0, 5)) { x.fillText(l, S / 2, y); y += 50 }
    // person
    x.fillStyle = color; x.font = 'bold 44px sans-serif'
    x.fillText(`— ${person}`, S / 2, Math.max(y + 60, 880))
    x.fillStyle = '#6b7280'; x.font = '30px serif'
    x.fillText(hanja, S / 2, Math.max(y + 108, 928))
    x.font = '30px sans-serif'
    x.fillText('toolboxy.net', S / 2, 1042)
    const a = document.createElement('a')
    a.download = `quote-${hanja}.png`
    a.href = cv.toDataURL('image/png')
    a.click()
  }

  return (
    <button onClick={save}
      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors">
      🖼 {label}
    </button>
  )
}
