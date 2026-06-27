// Pure client-side resize used by the batch-image-resizer tool.
// Returns a { blob, filename } for BatchImageProcessor, or null to skip
// (e.g. a format the browser can't decode, like most HEIC).

export type ResizeMode = 'dimensions' | 'percent' | 'maxside'
export type ResizeAxis = 'longest' | 'shortest' | 'width' | 'height'

export interface ResizeOptions {
  mode: ResizeMode
  width?: number // px, dimensions mode
  height?: number // px, dimensions mode
  keepRatio: boolean // dimensions mode
  percent: number // percent mode (e.g. 50 = 50%)
  maxSide: number // maxside mode: target px for the chosen axis (downscale only)
  axis?: ResizeAxis // maxside mode: which axis maxSide caps (default longest)
}

// Keep the original format where the browser can re-encode it; otherwise fall
// back to PNG. JPEG/WebP get a high quality so resizing isn't lossy-looking.
function outputFor(type: string): { mime: string; quality?: number; ext: string } {
  if (type === 'image/jpeg' || type === 'image/jpg') return { mime: 'image/jpeg', quality: 0.92, ext: 'jpg' }
  if (type === 'image/webp') return { mime: 'image/webp', quality: 0.92, ext: 'webp' }
  if (type === 'image/png') return { mime: 'image/png', ext: 'png' }
  return { mime: 'image/png', ext: 'png' }
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
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const { mime, quality, ext } = outputFor(file.type)
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mime, quality))
  if (!blob) return null
  const base = file.name.replace(/\.[^./\\]+$/, '')
  return { blob, filename: `${base}.${ext}` }
}
