// Song lyrics from lrclib.net (free, CORS-open). Returns time-synced lines when available, else
// plain text. The search only matches on a clean "artist"/"title", so we strip the junk markers
// people leave in filenames/tags ("가사", "lyrics", "Official Lyrics", "(COVER)", "| 가사/lyrics",
// "[가사/lyrics]", MV/HD/audio tags…) BEFORE querying — otherwise lrclib finds nothing.

export type SyncedLine = { t: number; text: string }
export type LyricsResult = { synced: SyncedLine[] | null; plain: string | null }
export type LyricsHit = { id: number; artist: string; title: string; album?: string; duration?: number; result: LyricsResult }

// A messy artist field ("♥️요즘 차트 점령 중인 저스틴 비버 신곡 ： Justin Bieber") hides the real name.
// Generate a few artist candidates to try, best-guess first: the Latin-name run, each separator
// segment, and a promo-word/emoji-stripped version. Capped so we don't fan out into many requests.
const PROMO = /\b(?:신곡|최신|인기|요즘|차트|점령|중인?|공식|발매|타이틀|수록곡|full|official|new|mv)\b|신곡|최신|인기|요즘|차트|점령|공식|발매|타이틀|수록곡/gi
export function artistCandidates(raw: string): string[] {
  // Strip emoji/symbols without the `u` flag (tsconfig target is < ES6): astral surrogates + the BMP
  // symbol/arrow/heart/dingbat ranges + variation selectors — none appear in real artist names.
  const noEmoji = (raw || '').replace(/[\uD800-\uDFFF←-⯿︀-️™ℹ]/g, ' ').replace(/\s+/g, ' ').trim()
  const out: string[] = []
  const add = (x: string) => { const c = cleanForLyrics(x); if (c && !out.includes(c)) out.push(c) }
  ;(noEmoji.match(/[A-Za-z][A-Za-z.'&\- ]{1,40}/g) || []).forEach(add) // Latin name run(s)
  noEmoji.split(/[：:|/·~]|\s[-–—]\s/).forEach(add)                     // separator segments
  add(noEmoji.replace(PROMO, ' '))                                     // promo-stripped whole
  add(noEmoji)
  return out.slice(0, 3)
}

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

// ---- IndexedDB cache: once a song's lyrics are found they're stored (keyed by clean artist|title),
// so replaying it — or any file of the same song — never hits the network again. Only hits are cached
// (a miss might just be lrclib being slow/down, so we let those retry).
const LDB = 'toolboxy-lyrics'
const LSTORE = 'lyrics'
function openLyricsDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') { resolve(null); return }
      const req = indexedDB.open(LDB, 1)
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(LSTORE)) req.result.createObjectStore(LSTORE, { keyPath: 'key' }) }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch { resolve(null) }
  })
}
async function getCached(key: string): Promise<LyricsResult | null> {
  try {
    const db = await openLyricsDB(); if (!db) return null
    return await new Promise((resolve) => {
      const r = db.transaction(LSTORE, 'readonly').objectStore(LSTORE).get(key)
      r.onsuccess = () => { const v = r.result as { synced?: SyncedLine[] | null; plain?: string | null } | undefined; resolve(v ? { synced: v.synced ?? null, plain: v.plain ?? null } : null) }
      r.onerror = () => resolve(null)
    })
  } catch { return null }
}
function putCached(key: string, val: LyricsResult): void {
  openLyricsDB().then((db) => { try { db?.transaction(LSTORE, 'readwrite').objectStore(LSTORE).put({ key, synced: val.synced, plain: val.plain, ts: Date.now() }) } catch { /* ignore */ } })
}

const jsonFetch = async (url: string, signal?: AbortSignal): Promise<unknown> => { try { const r = await fetch(url, { signal }); return r.ok ? await r.json() : null } catch { return null } }

// One artist attempt: exact /get (with duration), /get without duration, then fuzzy /search.
async function searchOne(title: string, artist: string, duration?: number, signal?: AbortSignal): Promise<LyricsResult | null> {
  if (!artist || !title) return null
  const a = encodeURIComponent(artist), t = encodeURIComponent(title)
  let got = pick(await jsonFetch(`${GET}?artist_name=${a}&track_name=${t}${duration && duration > 1 ? `&duration=${Math.round(duration)}` : ''}`, signal) as LrcRow)
  if (!got && duration && duration > 1) got = pick(await jsonFetch(`${GET}?artist_name=${a}&track_name=${t}`, signal) as LrcRow)
  if (!got) { const arr = await jsonFetch(`${SEARCH}?track_name=${t}&artist_name=${a}`, signal); if (Array.isArray(arr) && arr.length) got = pick((arr as LrcRow[]).find((x) => x.syncedLyrics) || (arr as LrcRow[]).find((x) => x.plainLyrics) || (arr as LrcRow[])[0]) }
  return got
}

// Persist a found result under the clean artist|title key (used when the user picks/edits manually).
export function cacheLyrics(rawArtist: string, rawTitle: string, val: LyricsResult): void {
  const key = (cleanForLyrics(rawArtist) + '|' + cleanForLyrics(rawTitle)).toLowerCase()
  if (key.length > 1) putCached(key, val)
}

// Stage 1: cache → try each artist candidate (title+artist) until one hits.
export async function fetchLyrics(rawArtist: string, rawTitle: string, duration?: number, signal?: AbortSignal): Promise<LyricsResult | null> {
  const title = cleanForLyrics(rawTitle)
  if (!title) return null
  const primary = cleanForLyrics(rawArtist)
  const key = (primary + '|' + title).toLowerCase()
  const cached = await getCached(key)
  if (cached && (cached.synced || cached.plain)) return cached // DB hit → no network
  const cands = [...artistCandidates(rawArtist), primary].filter((v, i, arr) => v && arr.indexOf(v) === i).slice(0, 3)
  for (const artist of cands) {
    if (signal?.aborted) return null
    const got = await searchOne(title, artist, duration, signal)
    if (got) { putCached(key, got); return got }
  }
  return null
}

// Stage 2: title-only search → a list of candidate songs (with lyrics) for the user to pick from.
export async function searchByTitle(rawTitle: string, signal?: AbortSignal): Promise<LyricsHit[]> {
  const title = cleanForLyrics(rawTitle)
  if (!title) return []
  const arr = await jsonFetch(`${SEARCH}?track_name=${encodeURIComponent(title)}`, signal)
  if (!Array.isArray(arr)) return []
  const rows = arr as (LrcRow & { id: number; artistName?: string; trackName?: string; albumName?: string; duration?: number })[]
  const seen = new Set<string>()
  const hits: LyricsHit[] = []
  for (const x of rows) {
    const result = pick(x)
    if (!result) continue
    const k = (x.artistName || '') + '|' + (x.trackName || '')
    if (seen.has(k)) continue
    seen.add(k)
    hits.push({ id: x.id, artist: x.artistName || '', title: x.trackName || '', album: x.albumName, duration: x.duration, result })
    if (hits.length >= 30) break
  }
  return hits
}
