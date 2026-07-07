// Song lyrics from lrclib.net (free, CORS-open). Returns time-synced lines when available, else
// plain text. The search only matches on a clean "artist"/"title", so we strip the junk markers
// people leave in filenames/tags ("가사", "lyrics", "Official Lyrics", "(COVER)", "| 가사/lyrics",
// "[가사/lyrics]", MV/HD/audio tags…) BEFORE querying — otherwise lrclib finds nothing.

export type SyncedLine = { t: number; text: string }
export type LyricsResult = { synced: SyncedLine[] | null; plain: string | null }

// Strip lyric/cover/site markers that break the lrclib match. Safe to run on an artist or a title.
export function cleanForLyrics(s: string): string {
  // NOTE: \b (word boundary) does NOT work around Hangul (Korean isn't a \w char), so Korean markers
  // are matched with a non-Hangul guard instead, and brackets are stripped whole before the loose rules.
  return (s || '')
    .replace(/[[(（【][^)\]）】]*(?:\b(?:lyrics?|cover|official|audio|video|mv|m\/v|hd|hq|4k|8k|teaser)\b|가사|자막)[^)\]）】]*[)\]）】]/gi, ' ') // "[가사/lyrics]", "(COVER)", "(Official …)"
    .replace(/[|/·~]\s*(?:가사|lyrics?)(?:\s*\/\s*(?:가사|lyrics?))?/gi, ' ')                                     // "| 가사/lyrics", "/ lyrics"
    .replace(/official\s*(?:lyrics?|video|audio|m\/v|mv)/gi, ' ')                                                 // "Official Lyrics"
    .replace(/\blyrics?\b/gi, ' ')                                                                                // bare "lyrics"
    .replace(/(^|[^가-힣])(?:가사|자막)(?![가-힣])/g, '$1 ')                                                        // bare "가사" / "자막" (Hangul-guarded)
    .replace(/\s+/g, ' ')
    .trim()
}

function parseSynced(lrc: string): SyncedLine[] {
  const out: SyncedLine[] = []
  const re = /\[(\d+):(\d+(?:\.\d+)?)\]/g
  for (const ln of lrc.split('\n')) {
    const times: number[] = []
    let m: RegExpExecArray | null
    re.lastIndex = 0
    while ((m = re.exec(ln)) !== null) times.push(parseInt(m[1]) * 60 + parseFloat(m[2]))
    if (!times.length) continue
    const text = ln.replace(/\[[^\]]*\]/g, '').trim()
    for (const t of times) out.push({ t, text })
  }
  return out.sort((a, b) => a.t - b.t)
}

type LrcRow = { syncedLyrics?: string; plainLyrics?: string; instrumental?: boolean }
function pick(d: LrcRow | null | undefined): LyricsResult | null {
  if (!d) return null
  if (d.syncedLyrics) { const s = parseSynced(String(d.syncedLyrics)); if (s.length) return { synced: s, plain: null } }
  if (d.plainLyrics) { const p = String(d.plainLyrics).trim(); if (p) return { synced: null, plain: p } }
  return null
}

const GET = 'https://lrclib.net/api/get'
const SEARCH = 'https://lrclib.net/api/search'

// Look up lyrics for a track. Tries, in order: exact /get (with duration), /get without duration
// (a wrong duration 404s the exact match), then the fuzzy /search (helps CJK titles).
export async function fetchLyrics(rawArtist: string, rawTitle: string, duration?: number, signal?: AbortSignal): Promise<LyricsResult | null> {
  const artist = cleanForLyrics(rawArtist)
  const title = cleanForLyrics(rawTitle)
  if (!artist || !title) return null
  const a = encodeURIComponent(artist)
  const t = encodeURIComponent(title)
  const json = async (url: string): Promise<unknown> => { try { const r = await fetch(url, { signal }); return r.ok ? await r.json() : null } catch { return null } }

  let got = pick(await json(`${GET}?artist_name=${a}&track_name=${t}${duration && duration > 1 ? `&duration=${Math.round(duration)}` : ''}`) as LrcRow)
  if (got) return got
  if (duration && duration > 1) { got = pick(await json(`${GET}?artist_name=${a}&track_name=${t}`) as LrcRow); if (got) return got }
  const arr = await json(`${SEARCH}?track_name=${t}&artist_name=${a}`)
  if (Array.isArray(arr) && arr.length) return pick((arr as LrcRow[]).find((x) => x.syncedLyrics) || (arr as LrcRow[]).find((x) => x.plainLyrics) || (arr as LrcRow[])[0])
  return null
}
