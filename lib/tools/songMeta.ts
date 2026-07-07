// Shared song-metadata helpers: the filename → artist/title parser (originally built for the music
// player) and the iTunes lookup used for album art. Used by music-player AND mp3-tag-editor so the
// two tools recognise names identically.
import { cleanForLyrics, quotedSplit } from './lyrics'

// Best-effort artist/title from a bare filename. There's no reliable way to know the order from a
// filename alone, so we clean the input up and lean on the dominant "Artist - Title" convention.
// Deliberately conservative:
//  • split ONLY on a clearly spaced dash-family separator ( - – — · | ~ ). We do NOT split on "," or
//    "/", because those usually separate multiple artists inside one field ("아이유, 최유리 - 봄날").
//  • strip a leading track number, bracketed junk tags ([MV], (Official Video), (HD)…), bitrate & URLs.
//  • only flip the order when a "(Remix)/(Inst.)/(feat. …)" marker sits on the FIRST chunk (that chunk
//    is clearly the title, so the other side is the artist).
export function parseFileName(raw: string): { artist: string; title: string } {
  let s = (raw || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  s = s.replace(/[[(（【][^)\]）】]*\b(?:official|lyrics?|lyric video|audio|video|mv|m\/v|hd|hq|4k|8k|teaser|가사|자막)\b[^)\]）】]*[)\]）】]/gi, ' ')
  s = s.replace(/\b\d{2,4}\s?k(?:bps|hz)\b/gi, ' ').replace(/\b(?:www\.\S+|[a-z0-9-]+\.(?:com|net|kr|org|io))\b/gi, ' ')
  s = s.replace(/[[(（【]\s*[)\]）】]/g, ' ') // drop empty brackets left behind by the strips above
  s = s.replace(/^\s*\d{1,3}\s*[.)\-–—]\s+/, '') // leading track number: "05.", "005 - ", "12)"
  s = s.replace(/\s+/g, ' ').trim()
  const parts = s.split(/\s+[-–—·|~]\s+/).map((p) => p.trim()).filter(Boolean)
  // Also strip lyric/cover markers ("가사", "lyrics", "(COVER)", "Official Lyrics", "| 가사/lyrics"…);
  // keep the original if a chunk is nothing but markers, so we never end up empty.
  const clean = (x: string) => cleanForLyrics(x) || x
  if (parts.length < 2) {
    // No dash separator → 「배성식 오무이 '내일도 인생'」 rule: a quoted run at the end is the title
    // (quotes dropped), the text before it the artist.
    const q = quotedSplit(s)
    if (q) return q
    return { artist: '', title: clean(s) }
  }
  const titleParen = /\([^)]*\b(?:remix|inst\.?|instrumental|live|ver\.?|version|acoustic|edit|remaster|mix|feat\.?|ft\.?|cover|ost|prod\.?)\b[^)]*\)/i
  if (parts.length === 2 && titleParen.test(parts[0]) && !titleParen.test(parts[1])) return { artist: clean(parts[1]), title: clean(parts[0]) }
  return { artist: clean(parts[0]), title: clean(parts.slice(1).join(' - ')) }
}

/** Leading track number from a filename ("05. …", "005 - …", "12) …"), or ''. */
export function parseTrackNo(raw: string): string {
  const m = (raw || '').match(/^\s*(\d{1,3})\s*[.)\-–—_\s]\s*/)
  return m ? String(parseInt(m[1], 10)) : ''
}

// ---- iTunes song lookup (title/artist + 600x600 artwork URL). CORS-open, no key needed. ----
export type ItunesSong = { title: string; artist: string; artUrl: string }
export async function searchItunesSong(term: string, signal?: AbortSignal): Promise<ItunesSong | null> {
  const q = (term || '').replace(/\s+/g, ' ').trim().slice(0, 60)
  if (!q) return null
  try {
    const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1`, { signal })
    if (!r.ok) return null
    const d = await r.json() as { results?: { trackName?: string; artistName?: string; artworkUrl100?: string }[] }
    const x = d?.results?.[0]
    if (!x) return null
    return { title: x.trackName || '', artist: x.artistName || '', artUrl: x.artworkUrl100 ? String(x.artworkUrl100).replace('100x100', '600x600') : '' }
  } catch { return null }
}

/** Download artwork bytes (for embedding, e.g. as an ID3 APIC frame). mzstatic serves CORS-open. */
export async function fetchArtBytes(url: string, signal?: AbortSignal): Promise<{ data: Uint8Array; mime: string } | null> {
  try {
    const r = await fetch(url, { signal })
    if (!r.ok) return null
    const ct = r.headers.get('content-type') || ''
    const mime = /png/i.test(ct) || /\.png(\?|$)/i.test(url) ? 'image/png' : 'image/jpeg'
    const data = new Uint8Array(await r.arrayBuffer())
    return data.length > 100 ? { data, mime } : null
  } catch { return null }
}
