// Pure client-side format conversion used by the batch-image-converter tool.
// JPG ↔ PNG ↔ WebP. Returns { blob, filename } for BatchImageProcessor, or
// null to skip (e.g. a format the browser can't decode, like most HEIC).

export type OutFormat = 'jpeg' | 'png' | 'webp'

export interface ConvertOptions {
  format: OutFormat
  quality: number // 1–100, applies to JPEG/WebP only (PNG is lossless)
}

const SPEC: Record<OutFormat, { mime: string; ext: string; lossy: boolean }> = {
  jpeg: { mime: 'image/jpeg', ext: 'jpg', lossy: true },
  png: { mime: 'image/png', ext: 'png', lossy: false },
  webp: { mime: 'image/webp', ext: 'webp', lossy: true },
}

export async function convertImage(
  file: File,
  options: ConvertOptions,
): Promise<{ blob: Blob; filename: string } | null> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null // undecodable format → skip gracefully
  }
  const { mime, ext, lossy } = SPEC[options.format]
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return null }
  // JPEG has no alpha — flatten transparency onto white so it isn't filled black.
  if (options.format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close?.()

  const quality = lossy ? Math.min(1, Math.max(0.01, (options.quality || 90) / 100)) : undefined
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mime, quality))
  if (!blob) return null
  const base = file.name.replace(/\.[^./\\]+$/, '')
  return { blob, filename: `${base}.${ext}` }
}
