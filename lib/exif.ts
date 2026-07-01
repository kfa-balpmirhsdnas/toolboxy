// Shared EXIF utilities: read JPEG metadata for display, and strip metadata from
// JPEG/PNG bytes WITHOUT re-encoding (the pixel data is left byte-for-byte intact).

export type Exif = {
  date?: string; camera?: string; lens?: string; colorSpace?: string
  aperture?: string; shutter?: string; iso?: string; bias?: string
  flash?: boolean; wb?: 'auto' | 'manual'; gps?: string
}

// Parse a TIFF/Exif block (shared by the JPEG and HEIC readers). `tiff` is the byte offset of the
// TIFF header ('II'/'MM') within the DataView.
function parseTiff(dv: DataView, tiff: number): Exif {
  try {
        const le = dv.getUint16(tiff) === 0x4949
        const u16 = (o: number) => dv.getUint16(o, le)
        const u32 = (o: number) => dv.getUint32(o, le)
        const s32 = (o: number) => dv.getInt32(o, le)
        const ascii = (o: number, c: number) => { let s = ''; for (let i = 0; i < c - 1; i++) { const ch = dv.getUint8(o + i); if (!ch) break; s += String.fromCharCode(ch) } return s.trim() }
        const SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 }
        type En = { type: number; count: number; e: number }
        const dir = (ifd: number) => { const out: Record<number, En> = {}; const n = u16(ifd); for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; out[u16(e)] = { type: u16(e + 2), count: u32(e + 4), e } } return out }
        const vo = (en: En) => (en.count * (SIZE[en.type] || 1) <= 4 ? en.e + 8 : tiff + u32(en.e + 8))
        const rat = (o: number) => { const d = u32(o + 4); return d ? u32(o) / d : 0 }
        const str = (en?: En) => (en ? ascii(vo(en), en.count) : '')
        const ex: Exif = {}
        const ifd0 = dir(tiff + u32(tiff + 4))
        ex.camera = [str(ifd0[0x010f]), str(ifd0[0x0110])].filter(Boolean).join(' ').trim() || undefined

        if (ifd0[0x8769]) {
          const x = dir(tiff + u32(vo(ifd0[0x8769])))
          const d = str(x[0x9003] || x[0x9004])
          if (d) ex.date = d.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
          ex.lens = str(x[0xa434]) || undefined
          if (x[0x829d]) ex.aperture = 'f/' + rat(vo(x[0x829d])).toFixed(1).replace(/\.0$/, '')
          if (x[0x829a]) { const v = rat(vo(x[0x829a])); ex.shutter = v > 0 && v < 1 ? `1/${Math.round(1 / v)} s` : `${(+v.toFixed(1))} s` }
          if (x[0x8827]) ex.iso = 'ISO ' + u16(vo(x[0x8827]))
          if (x[0x9204]) { const o = vo(x[0x9204]); const bv = s32(o) / (s32(o + 4) || 1); ex.bias = `${bv > 0 ? '+' : ''}${+bv.toFixed(1)} EV` }
          if (x[0x9209]) ex.flash = (u16(vo(x[0x9209])) & 1) === 1
          if (x[0xa403]) ex.wb = u16(vo(x[0xa403])) === 0 ? 'auto' : 'manual'
          if (x[0xa001]) ex.colorSpace = u16(vo(x[0xa001])) === 1 ? 'sRGB' : 'Uncalibrated'
        }
        if (ifd0[0x8825]) {
          const g = dir(tiff + u32(vo(ifd0[0x8825])))
          const dms = (en?: En, ref?: string) => { if (!en) return undefined; const o = vo(en); const deg = rat(o) + rat(o + 8) / 60 + rat(o + 16) / 3600; return (ref === 'S' || ref === 'W' ? -deg : deg) }
          const lat = dms(g[0x0002], str(g[0x0001])); const lon = dms(g[0x0004], str(g[0x0003]))
          if (lat !== undefined && lon !== undefined) ex.gps = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
        }
        return ex
  } catch { /* ignore */ }
  return {}
}

// JPEG EXIF reader — camera/lens, exposure settings, colour space, GPS (best effort).
export async function readExif(file: File): Promise<Exif> {
  try {
    if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return {}
    const dv = new DataView(await file.slice(0, 262144).arrayBuffer())
    if (dv.getUint16(0) !== 0xffd8) return {}
    let off = 2
    while (off + 4 < dv.byteLength) {
      const marker = dv.getUint16(off)
      if ((marker & 0xff00) !== 0xff00) break
      if (marker === 0xffe1) {
        const seg = off + 4
        if (dv.getUint32(seg) !== 0x45786966) return {} // 'Exif'
        return parseTiff(dv, seg + 6)
      }
      off += 2 + dv.getUint16(off + 2)
    }
  } catch { /* ignore */ }
  return {}
}

// HEIC/HEIF EXIF reader. heic2any drops EXIF on conversion, so we read the original file and scan
// the head for the embedded "Exif\0\0" + TIFF block (in the HEIF meta/mdat), then parse it.
export async function readHeicExif(file: File): Promise<Exif> {
  try {
    const buf = new Uint8Array(await file.slice(0, 2_000_000).arrayBuffer())
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    for (let i = 0; i + 8 < buf.length; i++) {
      // "Exif\0\0"
      if (buf[i] === 0x45 && buf[i + 1] === 0x78 && buf[i + 2] === 0x69 && buf[i + 3] === 0x66 && buf[i + 4] === 0 && buf[i + 5] === 0) {
        const tiff = i + 6
        const bo = dv.getUint16(tiff)
        if (bo === 0x4949 || bo === 0x4d4d) return parseTiff(dv, tiff)
      }
    }
  } catch { /* ignore */ }
  return {}
}

const isJpeg = (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8
const isPng = (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47

// JPEG: drop APP1 (Exif/XMP) and APP13 (IPTC/Photoshop) segments; keep JFIF, ICC, image data.
function stripJpegAll(b: Uint8Array): Uint8Array {
  const keep: [number, number][] = [[0, 2]]
  let i = 2
  while (i < b.length - 1) {
    if (b[i] !== 0xff) break
    const m = b[i + 1]
    if (m === 0xda) { keep.push([i, b.length]); break } // SOS → image data
    if (m === 0xd9) { keep.push([i, i + 2]); break }
    if (m >= 0xd0 && m <= 0xd7) { keep.push([i, i + 2]); i += 2; continue }
    const len = (b[i + 2] << 8) | b[i + 3]
    const end = i + 2 + len
    if (m !== 0xe1 && m !== 0xed) keep.push([i, end])
    i = end
  }
  let total = 0; for (const [s, e] of keep) total += e - s
  const out = new Uint8Array(total); let o = 0
  for (const [s, e] of keep) { out.set(b.subarray(s, e), o); o += e - s }
  return out
}

// JPEG: zero only the GPS IFD + its data, in place (other EXIF preserved).
function stripJpegGps(b: Uint8Array): Uint8Array {
  const out = b.slice()
  let i = 2
  while (i < out.length - 1) {
    if (out[i] !== 0xff) break
    const m = out[i + 1]
    if (m === 0xda || m === 0xd9) break
    const len = (out[i + 2] << 8) | out[i + 3]
    if (m === 0xe1 && out[i + 4] === 0x45 && out[i + 5] === 0x78 && out[i + 6] === 0x69 && out[i + 7] === 0x66) {
      const tiff = i + 10
      const dv = new DataView(out.buffer, out.byteOffset, out.byteLength)
      const le = dv.getUint16(tiff) === 0x4949
      const u16 = (o: number) => dv.getUint16(o, le)
      const u32 = (o: number) => dv.getUint32(o, le)
      const SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 }
      const ifd0 = tiff + u32(tiff + 4)
      const n = u16(ifd0)
      for (let e = 0; e < n; e++) {
        const eo = ifd0 + 2 + e * 12
        if (u16(eo) === 0x8825) {
          const gps = tiff + u32(eo + 8)
          const gn = u16(gps)
          for (let g = 0; g < gn; g++) {
            const go = gps + 2 + g * 12
            const sz = (SIZE[u16(go + 2)] || 1) * u32(go + 4)
            if (sz > 4) { const d = tiff + u32(go + 8); for (let z = 0; z < sz && d + z < out.length; z++) out[d + z] = 0 }
          }
          for (let z = 0; z < 2 + gn * 12 + 4 && gps + z < out.length; z++) out[gps + z] = 0
          out[eo] = 0; out[eo + 1] = 0 // neutralise the GPS pointer tag in IFD0
          break
        }
      }
      break
    }
    i += 2 + len
  }
  return out
}

// PNG: drop text + EXIF + time chunks (keep IHDR/IDAT/IEND/pHYs/colour chunks).
function stripPngAll(b: Uint8Array): Uint8Array {
  const drop = new Set(['tEXt', 'iTXt', 'zTXt', 'eXIf', 'tIME'])
  const keep: [number, number][] = [[0, 8]]
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength)
  let i = 8
  while (i + 8 <= b.length) {
    const len = dv.getUint32(i)
    const type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7])
    const end = i + 12 + len
    if (!drop.has(type)) keep.push([i, end])
    if (type === 'IEND') break
    i = end
  }
  let total = 0; for (const [s, e] of keep) total += e - s
  const out = new Uint8Array(total); let o = 0
  for (const [s, e] of keep) { out.set(b.subarray(s, e), o); o += e - s }
  return out
}

/** Strip metadata without touching pixels. mode 'all' = everything; 'gps' = JPEG location only.
 *  Returns null for formats we don't strip (caller keeps the original). */
export function stripImageMeta(bytes: Uint8Array, mode: 'all' | 'gps'): Uint8Array | null {
  if (isJpeg(bytes)) return mode === 'gps' ? stripJpegGps(bytes) : stripJpegAll(bytes)
  if (isPng(bytes)) return stripPngAll(bytes)
  return null
}
