// Pure client-side watermarking used by the batch-image-watermark tool.
// Composites a text or logo-image watermark onto each picture via canvas.
// Returns { blob, filename } for BatchImageProcessor, or null to skip.

export type WatermarkType = 'text' | 'image'

// 9-grid placement: t/m/b (top/middle/bottom) × l/c/r (left/center/right).
export type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'

export interface WatermarkOptions {
  type: WatermarkType
  opacity: number // 1–100
  position: Position
  // text
  text?: string
  fontPct?: number // font size as % of image width (e.g. 5)
  color?: string // hex
  // image (logo)
  logo?: ImageBitmap | null
  logoScalePct?: number // logo width as % of image width
}

function outputFor(type: string): { mime: string; quality?: number; ext: string } {
  if (type === 'image/jpeg' || type === 'image/jpg') return { mime: 'image/jpeg', quality: 0.92, ext: 'jpg' }
  if (type === 'image/webp') return { mime: 'image/webp', quality: 0.92, ext: 'webp' }
  return { mime: 'image/png', ext: 'png' }
}

// Top-left corner for a content box of size (cw, ch) within (W, H) at position.
function place(pos: Position, W: number, H: number, cw: number, ch: number, pad: number): { x: number; y: number } {
  const v = pos[0] // t / m / b
  const h = pos[1] // l / c / r
  const x = h === 'l' ? pad : h === 'r' ? W - cw - pad : (W - cw) / 2
  const y = v === 't' ? pad : v === 'b' ? H - ch - pad : (H - ch) / 2
  return { x, y }
}

export async function watermarkImage(
  file: File,
  o: WatermarkOptions,
): Promise<{ blob: Blob; filename: string } | null> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null
  }
  const W = bitmap.width
  const H = bitmap.height
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return null }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close?.()

  const pad = Math.round(Math.min(W, H) * 0.03)
  ctx.globalAlpha = Math.min(1, Math.max(0, (o.opacity ?? 100) / 100))

  if (o.type === 'text') {
    const text = o.text || ''
    if (text) {
      const fontPx = Math.max(8, Math.round(W * ((o.fontPct || 5) / 100)))
      ctx.font = `bold ${fontPx}px sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      const cw = ctx.measureText(text).width
      const ch = fontPx
      const { x, y } = place(o.position, W, H, cw, ch, pad)
      // Subtle outline keeps the text legible on any background.
      ctx.lineJoin = 'round'
      ctx.lineWidth = Math.max(1, fontPx / 12)
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.strokeText(text, x, y)
      ctx.fillStyle = o.color || '#ffffff'
      ctx.fillText(text, x, y)
    }
  } else if (o.type === 'image' && o.logo) {
    const lw = Math.max(1, Math.round(W * ((o.logoScalePct || 20) / 100)))
    const lh = Math.round(o.logo.height * (lw / o.logo.width))
    const { x, y } = place(o.position, W, H, lw, lh, pad)
    ctx.drawImage(o.logo, x, y, lw, lh)
  }
  ctx.globalAlpha = 1

  const { mime, quality, ext } = outputFor(file.type)
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mime, quality))
  if (!blob) return null
  const base = file.name.replace(/\.[^./\\]+$/, '')
  return { blob, filename: `${base}.${ext}` }
}
