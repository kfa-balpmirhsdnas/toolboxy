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

// ---------------------------------------------------------------------------
// Full ID3 editing support (mp3-tag-editor). Reads v1 + v2.2/2.3/2.4 into an
// editable field set, PRESERVES every frame we don't edit as raw bytes, and
// writes a fresh ID3v2.3 tag (best player/Explorer compatibility). The audio
// (MPEG frames) is never touched — tag block swap only, lossless.
// ---------------------------------------------------------------------------

export type Id3Fields = {
  title: string; artist: string; album: string; albumArtist: string
  year: string; genre: string; track: string; disc: string; comment: string
  composer: string; lyrics: string; bpm: string; copyright: string
}
export const EMPTY_FIELDS: Id3Fields = { title: '', artist: '', album: '', albumArtist: '', year: '', genre: '', track: '', disc: '', comment: '', composer: '', lyrics: '', bpm: '', copyright: '' }

export type Id3Full = {
  fields: Id3Fields
  cover: { data: Uint8Array; mime: string } | null
  raw: Uint8Array[]        // v2.3-format frames (header+body) we keep verbatim on save
  audioStart: number       // where the MPEG data begins (after the v2 tag)
  audioEnd: number         // where it ends (before a trailing ID3v1 block)
  ver: number              // 0 = no v2 tag
}

// ID3v1 genre indices (only the stable "Winamp" set most files actually use).
const V1_GENRES = ['Blues','Classic Rock','Country','Dance','Disco','Funk','Grunge','Hip-Hop','Jazz','Metal','New Age','Oldies','Other','Pop','R&B','Rap','Reggae','Rock','Techno','Industrial','Alternative','Ska','Death Metal','Pranks','Soundtrack','Euro-Techno','Ambient','Trip-Hop','Vocal','Jazz+Funk','Fusion','Trance','Classical','Instrumental','Acid','House','Game','Sound Clip','Gospel','Noise','Alt. Rock','Bass','Soul','Punk','Space','Meditative','Instrumental Pop','Instrumental Rock','Ethnic','Gothic','Darkwave','Techno-Industrial','Electronic','Pop-Folk','Eurodance','Dream','Southern Rock','Comedy','Cult','Gangsta Rap','Top 40','Christian Rap','Pop/Funk','Jungle','Native American','Cabaret','New Wave','Psychedelic','Rave','Showtunes','Trailer','Lo-Fi','Tribal','Acid Punk','Acid Jazz','Polka','Retro','Musical','Rock & Roll','Hard Rock']

// v2.3/2.4 text frame → editable field. v2.4's TDRC replaces TYER (year = first 4 chars).
const MAP34: Record<string, keyof Id3Fields> = { TIT2: 'title', TPE1: 'artist', TALB: 'album', TPE2: 'albumArtist', TYER: 'year', TCON: 'genre', TRCK: 'track', TPOS: 'disc', TCOM: 'composer', TBPM: 'bpm', TCOP: 'copyright' }
const MAP2: Record<string, keyof Id3Fields> = { TT2: 'title', TP1: 'artist', TAL: 'album', TP2: 'albumArtist', TYE: 'year', TCO: 'genre', TRK: 'track', TPA: 'disc', TCM: 'composer', TBP: 'bpm', TCR: 'copyright' }

// "(13)Pop" legacy TCON → "Pop"; bare "(13)" → the v1 genre name.
function cleanGenre(g: string): string {
  const m = g.match(/^\((\d+)\)(.*)$/)
  if (!m) return g
  const rest = m[2].trim()
  return rest || V1_GENRES[parseInt(m[1], 10)] || ''
}

// COMM / USLT body: enc(1) lang(3) desc(terminated) text. Returns desc + text.
function parseLangFrame(data: Uint8Array): { desc: string; text: string } {
  const enc = data[0]
  let i = 4
  const wide = enc === 1 || enc === 2
  const dStart = i
  if (wide) { while (i + 1 < data.length && !(data[i] === 0 && data[i + 1] === 0)) i += 2 } else { while (i < data.length && data[i] !== 0) i++ }
  const desc = clean(decodeText(data.subarray(dStart, i), enc))
  i += wide ? 2 : 1
  return { desc, text: clean(decodeText(data.subarray(i), enc)) }
}

function parseApic(data: Uint8Array, ver: number): { data: Uint8Array; mime: string } | null {
  const enc = data[0]
  let i = 1
  let mime = 'image/jpeg'
  if (ver === 2) { const ext = String.fromCharCode(data[1], data[2], data[3]).toLowerCase(); mime = ext.includes('png') ? 'image/png' : 'image/jpeg'; i = 4 }
  else { let j = 1; while (j < data.length && data[j] !== 0) j++; mime = new TextDecoder('iso-8859-1').decode(data.subarray(1, j)) || 'image/jpeg'; i = j + 1 }
  i += 1 // picture type
  if (enc === 1 || enc === 2) { while (i + 1 < data.length && !(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2 } else { while (i < data.length && data[i] !== 0) i++; i += 1 }
  const img = data.subarray(i)
  return img.length > 40 ? { data: new Uint8Array(img), mime } : null
}

export async function readId3Full(file: File): Promise<Id3Full> {
  const out: Id3Full = { fields: { ...EMPTY_FIELDS }, cover: null, raw: [], audioStart: 0, audioEnd: file.size, ver: 0 }
  try {
    // Trailing ID3v1 (read-only; stripped on save so stale values can't linger).
    if (file.size > 128) {
      const t = new Uint8Array(await file.slice(file.size - 128).arrayBuffer())
      if (t[0] === 0x54 && t[1] === 0x41 && t[2] === 0x47) { // "TAG"
        out.audioEnd = file.size - 128
        const s = (a: number, b: number) => clean(new TextDecoder('iso-8859-1').decode(t.subarray(a, b)))
        const f = out.fields
        f.title = s(3, 33); f.artist = s(33, 63); f.album = s(63, 93); f.year = s(93, 97)
        if (t[125] === 0 && t[126] !== 0) { f.track = String(t[126]); f.comment = s(97, 125) } else f.comment = s(97, 127)
        if (t[127] < V1_GENRES.length) f.genre = V1_GENRES[t[127]]
      }
    }
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer())
    if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return out // v1 only (or no tag)
    const ver = head[3]
    const size = syncsafe(head, 6)
    if (size <= 0 || size > 50_000_000) return out
    out.ver = ver
    out.audioStart = 10 + size + ((head[5] & 0x10) ? 10 : 0) // + v2.4 footer
    const buf = new Uint8Array(await file.slice(0, 10 + size).arrayBuffer())
    const f = out.fields
    // v2 wins over any v1 values — reset fields the v2 tag actually carries as we hit them.
    const map = ver === 2 ? MAP2 : MAP34
    const picId = ver === 2 ? 'PIC' : 'APIC'
    const commId = ver === 2 ? 'COM' : 'COMM'
    const lyrId = ver === 2 ? 'ULT' : 'USLT'
    const idLen = ver === 2 ? 3 : 4
    const hdrLen = ver === 2 ? 6 : 10
    let sawComment = false; let sawLyrics = false
    let p = 10
    if (ver > 2 && (head[5] & 0x40)) { // skip extended header
      const es = ver === 4 ? syncsafe(buf, 10) : (((buf[10] << 24) | (buf[11] << 16) | (buf[12] << 8) | buf[13]) >>> 0) + 4
      p += es
    }
    while (p + hdrLen <= buf.length) {
      if (buf[p] === 0) break // padding
      let id = ''
      for (let k = 0; k < idLen; k++) id += String.fromCharCode(buf[p + k])
      let frameSize: number
      if (ver === 2) frameSize = (buf[p + 3] << 16) | (buf[p + 4] << 8) | buf[p + 5]
      else if (ver === 4) frameSize = syncsafe(buf, p + 4)
      else frameSize = ((buf[p + 4] << 24) | (buf[p + 5] << 16) | (buf[p + 6] << 8) | buf[p + 7]) >>> 0
      const dataStart = p + hdrLen
      if (frameSize <= 0 || dataStart + frameSize > buf.length) break
      const data = buf.subarray(dataStart, dataStart + frameSize)
      const field = map[id]
      const flags = ver === 2 ? 0 : (buf[p + 8] << 8) | buf[p + 9]
      if (field) {
        let v = clean(decodeText(data.subarray(1), data[0]))
        if (id === 'TCON' || id === 'TCO') v = cleanGenre(v)
        f[field] = v
      } else if (ver === 4 && id === 'TDRC') {
        const v = clean(decodeText(data.subarray(1), data[0]))
        if (v) f.year = v.slice(0, 4)
      } else if (id === picId) {
        if (!out.cover) out.cover = parseApic(data, ver)
      } else if (id === commId) {
        const c = parseLangFrame(data)
        // The plain (description-less) comment is editable; tool-specific ones (iTunNORM…) are preserved raw.
        if (!sawComment && !c.desc) { f.comment = c.text; sawComment = true }
        else if (ver === 3 && !(flags & 0xff)) out.raw.push(new Uint8Array(buf.subarray(p, dataStart + frameSize)))
      } else if (id === lyrId) {
        const c = parseLangFrame(data)
        if (!sawLyrics) { f.lyrics = c.text; sawLyrics = true }
      } else if (ver === 3) {
        // Unknown v2.3 frame → keep verbatim (header+body).
        out.raw.push(new Uint8Array(buf.subarray(p, dataStart + frameSize)))
      } else if (ver === 4 && !((flags >> 8) & 0xff) && !(flags & 0x0f)) {
        // Unknown v2.4 frame with no status/format flags → re-headered with a plain (non-syncsafe)
        // size so it's valid inside our v2.3 tag. Flagged frames (compressed/unsync…) are dropped.
        const fr = new Uint8Array(10 + frameSize)
        for (let k = 0; k < 4; k++) fr[k] = buf[p + k]
        fr[4] = (frameSize >>> 24) & 0xff; fr[5] = (frameSize >>> 16) & 0xff; fr[6] = (frameSize >>> 8) & 0xff; fr[7] = frameSize & 0xff
        fr.set(data, 10)
        out.raw.push(fr)
      }
      p = dataStart + frameSize
    }
    return out
  } catch { return out }
}

// ---- ID3v2.3 writer ----
const latin1Ok = (s: string) => /^[\x20-\xFF\t\n\r]*$/.test(s)
function encLatin1(s: string): Uint8Array { const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff; return b }
function encUtf16(s: string): Uint8Array { const b = new Uint8Array(2 + s.length * 2); b[0] = 0xff; b[1] = 0xfe; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[2 + i * 2] = c & 0xff; b[3 + i * 2] = c >> 8 } return b }
function concatBytes(parts: Uint8Array[]): Uint8Array {
  let n = 0; for (const x of parts) n += x.length
  const out = new Uint8Array(n); let o = 0
  for (const x of parts) { out.set(x, o); o += x.length }
  return out
}
function rawFrame(id: string, body: Uint8Array): Uint8Array {
  const fr = new Uint8Array(10 + body.length)
  for (let k = 0; k < 4; k++) fr[k] = id.charCodeAt(k)
  fr[4] = (body.length >>> 24) & 0xff; fr[5] = (body.length >>> 16) & 0xff; fr[6] = (body.length >>> 8) & 0xff; fr[7] = body.length & 0xff
  fr.set(body, 10)
  return fr
}
function textFrame(id: string, v: string): Uint8Array | null {
  const s = v.trim()
  if (!s) return null
  const body = latin1Ok(s) ? concatBytes([new Uint8Array([0]), encLatin1(s)]) : concatBytes([new Uint8Array([1]), encUtf16(s)])
  return rawFrame(id, body)
}
function langFrame(id: string, text: string): Uint8Array | null {
  const s = text.replace(/\r\n/g, '\n').trim()
  if (!s) return null
  const lang = encLatin1('eng')
  const body = latin1Ok(s)
    ? concatBytes([new Uint8Array([0]), lang, new Uint8Array([0]), encLatin1(s)])
    : concatBytes([new Uint8Array([1]), lang, encUtf16(''), new Uint8Array([0, 0]), encUtf16(s)])
  return rawFrame(id, body)
}

/** Build a complete ID3v2.3 tag from the edited fields + preserved raw frames + cover. */
export function buildId3v23(fields: Id3Fields, cover: { data: Uint8Array; mime: string } | null, raw: Uint8Array[]): Uint8Array {
  const frames: Uint8Array[] = []
  const ORDER: [string, keyof Id3Fields][] = [['TIT2', 'title'], ['TPE1', 'artist'], ['TALB', 'album'], ['TPE2', 'albumArtist'], ['TYER', 'year'], ['TCON', 'genre'], ['TRCK', 'track'], ['TPOS', 'disc'], ['TCOM', 'composer'], ['TBPM', 'bpm'], ['TCOP', 'copyright']]
  for (const [id, key] of ORDER) { const fr = textFrame(id, fields[key]); if (fr) frames.push(fr) }
  const comm = langFrame('COMM', fields.comment); if (comm) frames.push(comm)
  const uslt = langFrame('USLT', fields.lyrics); if (uslt) frames.push(uslt)
  if (cover && cover.data.length) {
    const mime = encLatin1(cover.mime || 'image/jpeg')
    frames.push(rawFrame('APIC', concatBytes([new Uint8Array([0]), mime, new Uint8Array([0, 3, 0]), cover.data]))) // enc 0, type 3 (front cover), empty desc
  }
  for (const r of raw) frames.push(r)
  const body = concatBytes(frames)
  const padding = 256
  const size = body.length + padding
  const tag = new Uint8Array(10 + size)
  tag[0] = 0x49; tag[1] = 0x44; tag[2] = 0x33; tag[3] = 3; tag[4] = 0; tag[5] = 0
  tag[6] = (size >>> 21) & 0x7f; tag[7] = (size >>> 14) & 0x7f; tag[8] = (size >>> 7) & 0x7f; tag[9] = size & 0x7f
  tag.set(body, 10)
  return tag
}

/** New MP3 = fresh tag (or none) + the untouched audio bytes. Trailing ID3v1 is dropped. */
export function writeMp3(file: File, tag: Uint8Array | null, meta: { audioStart: number; audioEnd: number }): Blob {
  const audio = file.slice(meta.audioStart, meta.audioEnd)
  return tag ? new Blob([tag as unknown as BlobPart, audio], { type: 'audio/mpeg' }) : new Blob([audio], { type: 'audio/mpeg' })
}

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
