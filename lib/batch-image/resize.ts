// Pure client-side resize used by the batch-image-resizer tool.
// Returns a { blob, filename } for BatchImageProcessor, or null to skip
// (e.g. a format the browser can't decode, like most HEIC).

export type ResizeMode = 'dimensions' | 'percent' | 'maxside'
export type ResizeAxis = 'longest' | 'shortest' | 'width' | 'height'
export type ResizeFormat = 'jpeg' | 'webp' | 'png'

export interface ResizeOptions {
  mode: ResizeMode
  width?: number // px, dimensions mode
  height?: number // px, dimensions mode
  keepRatio: boolean // dimensions mode
  percent: number // percent mode (e.g. 50 = 50%)
  maxSide: number // maxside mode: target px for the chosen axis (downscale only)
  axis?: ResizeAxis // maxside mode: which axis maxSide caps (default longest)
  quality?: number // 1–100 output quality for JPEG/WebP (PNG is lossless)
  format?: ResizeFormat // output format; defaults to keeping the original
}

// Use the explicit output format if given, else keep the original (fall back to
// PNG). JPEG/WebP honor the quality option; PNG is lossless.
function outputFor(type: string, format?: ResizeFormat): { mime: string; ext: string; lossy: boolean } {
  const f: ResizeFormat = format
    ?? (type === 'image/jpeg' || type === 'image/jpg' ? 'jpeg' : type === 'image/webp' ? 'webp' : 'png')
  if (f === 'jpeg') return { mime: 'image/jpeg', ext: 'jpg', lossy: true }
  if (f === 'webp') return { mime: 'image/webp', ext: 'webp', lossy: true }
  return { mime: 'image/png', ext: 'png', lossy: false }
}

function targetSize(ow: number, oh: number, o: ResizeOptions): { w: number; h: number } {
  let w = ow
  let h = oh
  if (o.mode === 'percent') {
    const p = (o.percent || 100) / 100
    w = ow * p
    h = oh * p
  } else if (o.mode === 'maxside') {
    const axis = o.axis || 'longest'
    const axisVal = axis === 'longest' ? Math.max(ow, oh)
      : axis === 'shortest' ? Math.min(ow, oh)
      : axis === 'width' ? ow : oh
    const cap = o.maxSide || axisVal
    const s = Math.min(1, cap / axisVal) // downscale only, keeps aspect ratio
    w = ow * s
    h = oh * s
  } else {
    // dimensions
    if (o.keepRatio) {
      const wLimit = o.width && o.width > 0 ? o.width : Infinity
      const hLimit = o.height && o.height > 0 ? o.height : Infinity
      const s = Math.min(wLimit / ow, hLimit / oh)
      if (Number.isFinite(s)) { w = ow * s; h = oh * s }
    } else {
      w = o.width && o.width > 0 ? o.width : ow
      h = o.height && o.height > 0 ? o.height : oh
    }
  }
  return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) }
}

export async function resizeImage(
  file: File,
  options: ResizeOptions,
): Promise<{ blob: Blob; filename: string } | null> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null // undecodable format → skip gracefully
  }
  const { w, h } = targetSize(bitmap.width, bitmap.height, options)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return null }
  ctx.imageSmoothingQuality = 'high'
  const { mime, ext, lossy } = outputFor(file.type, options.format)
  // JPEG has no alpha — flatten transparency onto white instead of black.
  if (mime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h) }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const quality = lossy ? Math.min(1, Math.max(0.01, (options.quality ?? 92) / 100)) : undefined
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mime, quality))
  if (!blob) return null
  const base = file.name.replace(/\.[^./\\]+$/, '')
  return { blob, filename: `${base}.${ext}` }
}
