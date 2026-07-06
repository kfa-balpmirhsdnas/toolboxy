// Minimal, dependency-free ID3v2 reader (v2.2 / v2.3 / v2.4). Pulls the title, artist, album and the
// embedded cover art (APIC/PIC) from the tag at the START of the file — only the tag bytes are read,
// everything is local (no network). Unknown/edge tags simply yield nothing rather than throwing.
export type Id3 = { title?: string; artist?: string; album?: string; cover?: Blob }

// Decode a text frame body by its ID3 encoding byte: 0=ISO-8859-1, 1=UTF-16+BOM, 2=UTF-16BE, 3=UTF-8.
function decodeText(bytes: Uint8Array, enc: number): string {
  try {
    if (enc === 1) {
      if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2))
      if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2))
      return new TextDecoder('utf-16le').decode(bytes)
    }
    if (enc === 2) return new TextDecoder('utf-16be').decode(bytes)
    if (enc === 3) return new TextDecoder('utf-8').decode(bytes)
    return new TextDecoder('iso-8859-1').decode(bytes)
  } catch { return '' }
}
const clean = (s: string) => s.replace(/\0+$/g, '').replace(/\0/g, ' ').trim()
const syncsafe = (b: Uint8Array, o: number) => (b[o] & 0x7f) * 0x200000 + (b[o + 1] & 0x7f) * 0x4000 + (b[o + 2] & 0x7f) * 0x80 + (b[o + 3] & 0x7f)

export async function readId3(file: File): Promise<Id3> {
  try {
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer())
    if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return {} // not "ID3"
    const ver = head[3] // major version: 2, 3 or 4
    const size = syncsafe(head, 6)
    if (size <= 0 || size > 20_000_000) return {}
    const buf = new Uint8Array(await file.slice(0, 10 + size).arrayBuffer())
    const out: Id3 = {}
    const textMap: Record<string, 'title' | 'artist' | 'album'> = ver === 2
      ? { TT2: 'title', TP1: 'artist', TAL: 'album' }
      : { TIT2: 'title', TPE1: 'artist', TALB: 'album' }
    const picId = ver === 2 ? 'PIC' : 'APIC'
    const idLen = ver === 2 ? 3 : 4
    const hdrLen = ver === 2 ? 6 : 10
    let p = 10
    while (p + hdrLen <= buf.length) {
      let id = ''
      for (let k = 0; k < idLen; k++) id += String.fromCharCode(buf[p + k])
      if (buf[p] === 0) break // padding
      let frameSize: number
      if (ver === 2) frameSize = (buf[p + 3] << 16) | (buf[p + 4] << 8) | buf[p + 5]
      else if (ver === 4) frameSize = syncsafe(buf, p + 4)
      else frameSize = ((buf[p + 4] << 24) | (buf[p + 5] << 16) | (buf[p + 6] << 8) | buf[p + 7]) >>> 0
      const dataStart = p + hdrLen
      if (frameSize <= 0 || dataStart + frameSize > buf.length) break
      const data = buf.subarray(dataStart, dataStart + frameSize)
      const field = textMap[id]
      if (field) {
        if (!out[field]) out[field] = clean(decodeText(data.subarray(1), data[0]))
      } else if (id === picId && !out.cover) {
        const enc = data[0]
        let i = 1
        let mime = 'image/jpeg'
        if (ver === 2) { const ext = String.fromCharCode(data[1], data[2], data[3]).toLowerCase(); mime = ext.includes('png') ? 'image/png' : 'image/jpeg'; i = 4 }
        else { let j = 1; while (j < data.length && data[j] !== 0) j++; mime = new TextDecoder('iso-8859-1').decode(data.subarray(1, j)) || 'image/jpeg'; i = j + 1 }
        i += 1 // picture type byte
        if (enc === 1 || enc === 2) { while (i + 1 < data.length && !(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2 } // UTF-16 desc: double-null
        else { while (i < data.length && data[i] !== 0) i++; i += 1 }
        const img = data.subarray(i)
        if (img.length > 40) out.cover = new Blob([img], { type: mime })
      }
      p = dataStart + frameSize
    }
    return out
  } catch { return {} }
}
