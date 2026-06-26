// Pure client-side compression used by the batch-image-compressor tool.
// Re-encodes images at a chosen quality, optionally searching for a quality
// that hits a target file size. Returns { blob, filename } for
// BatchImageProcessor, or null to skip (undecodable input).

export interface CompressOptions {
  quality: number // 1–100, for lossy formats (JPEG/WebP)
  targetKB?: number // optional: try to get under this size (lossy only)
}

// Compression keeps the original format. PNG is lossless so quality is ignored;
// most savings there come from re-encoding. JPEG/WebP honor quality.
function spec(type: string): { mime: string; ext: string; lossy: boolean } {
  if (type === 'image/png') return { mime: 'image/png', ext: 'png', lossy: false }
  if (type === 'image/webp') return { mime: 'image/webp', ext: 'webp', lossy: true }
  // jpeg and everything else → jpeg
  return { mime: 'image/jpeg', ext: 'jpg', lossy: true }
}

const toBlob = (canvas: HTMLCanvasElement, mime: string, q?: number): Promise<Blob | null> =>
  new Promise((res) => canvas.toBlob(res, mime, q))

export async function compressImage(
  file: File,
  options: CompressOptions,
): Promise<{ blob: Blob; filename: string } | null> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null
  }
  const { mime, ext, lossy } = spec(file.type)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return null }
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close?.()

  let blob: Blob | null
  if (!lossy) {
    blob = await toBlob(canvas, mime)
  } else if (options.targetKB && options.targetKB > 0) {
    // Step quality down from the chosen value until under the target; keep the
    // smallest if the target can't be reached.
    const targetBytes = options.targetKB * 1024
    let q = Math.min(1, Math.max(0.1, (options.quality || 80) / 100))
    let best = await toBlob(canvas, mime, q)
    while (best && best.size > targetBytes && q > 0.1) {
      q = Math.max(0.1, q - 0.1)
      const next = await toBlob(canvas, mime, q)
      if (!next) break
      best = next
    }
    blob = best
  } else {
    blob = await toBlob(canvas, mime, Math.min(1, Math.max(0.01, (options.quality || 80) / 100)))
  }
  if (!blob) return null
  const base = file.name.replace(/\.[^./\\]+$/, '')
  return { blob, filename: `${base}.${ext}` }
}
