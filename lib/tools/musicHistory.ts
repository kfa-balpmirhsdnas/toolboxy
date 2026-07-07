// Playlist persistence for the Music Player — same hybrid model as the video player, but its
// OWN IndexedDB so music tracks and video clips never mix:
//   • metadata (name/size/type) is kept for EVERY recent track, so the list survives a refresh.
//   • the actual audio BLOB is kept ONLY for 보관(starred) tracks, so only those replay in one click.
// All ops fail soft — if IndexedDB is unavailable/quota-full, the in-memory session list still works.

const DB_NAME = 'toolboxy-music'
const STORE = 'history'
const DB_VERSION = 1

export const MH_MAX_BYTES = 200 * 1024 * 1024      // per-file cap for a ★-stored blob (200 MB)
export const MH_MAX_ITEMS = 999                    // metadata is tiny, so keep plenty (favorites are never evicted)
export const MH_AUTOSAVE_PERFILE = 20 * 1024 * 1024 // auto-cache skips files bigger than this (20 MB)

// Once the browser's storage quota is hit we stop trying to auto-cache blobs (each failed write is
// wasted work). Reset when the user frees space (clear list / drop cache).
let autoFull = false

export type MHItem = { id: string; name: string; size: number; type: string; ts: number; blob?: Blob }

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no-idb')); return }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' }) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function store(db: IDBDatabase, mode: IDBTransactionMode) { return db.transaction(STORE, mode).objectStore(STORE) }
function reqP<T>(r: IDBRequest<T>): Promise<T> { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) }) }

async function mhGet(id: string): Promise<MHItem | undefined> {
  try { const db = await openDB(); return await reqP(store(db, 'readonly').get(id)) as MHItem | undefined } catch { return undefined }
}

export async function mhList(): Promise<MHItem[]> {
  try {
    const db = await openDB()
    return await new Promise<MHItem[]>((resolve) => {
      const items: MHItem[] = []
      const cur = store(db, 'readonly').openCursor()
      cur.onsuccess = () => { const c = cur.result; if (c) { items.push(c.value as MHItem); c.continue() } else resolve(items.sort((a, b) => b.ts - a.ts)) }
      cur.onerror = () => resolve([])
    })
  } catch { return [] }
}

async function evict(): Promise<void> {
  try {
    const all = await mhList()
    const metaOnly = all.filter((x) => !x.blob)
    if (metaOnly.length > MH_MAX_ITEMS) {
      const st = store(await openDB(), 'readwrite')
      metaOnly.slice(MH_MAX_ITEMS).forEach((x) => st.delete(x.id))
    }
  } catch { /* ignore */ }
}

export async function mhPutMeta(meta: { id: string; name: string; size: number; type: string }): Promise<void> {
  try {
    const prev = await mhGet(meta.id)
    const db = await openDB()
    store(db, 'readwrite').put({ id: meta.id, name: meta.name, size: meta.size, type: meta.type, ts: Date.now(), blob: prev?.blob })
    await evict()
  } catch { /* ignore */ }
}

export async function mhPutManyMeta(metas: { id: string; name: string; size: number; type: string }[]): Promise<void> {
  if (!metas.length) return
  try {
    const existing = await mhList()
    const byId = new Map(existing.map((x) => [x.id, x]))
    const db = await openDB()
    const st = store(db, 'readwrite')
    const base = Date.now()
    metas.forEach((m, i) => { const prev = byId.get(m.id); st.put({ id: m.id, name: m.name, size: m.size, type: m.type, ts: base - i, blob: prev?.blob }) })
    await new Promise<void>((res) => { st.transaction.oncomplete = () => res(); st.transaction.onerror = () => res(); st.transaction.onabort = () => res() })
    await evict()
  } catch { /* ignore */ }
}

// ★ Save: write metadata + blob in one put. Blobs above the cap are skipped (metadata still stored).
export async function mhSave(meta: { id: string; name: string; size: number; type: string }, blob: Blob): Promise<void> {
  if (blob.size > MH_MAX_BYTES) { await mhPutMeta(meta); return }
  try {
    const prev = await mhGet(meta.id)
    const db = await openDB()
    store(db, 'readwrite').put({ id: meta.id, name: meta.name, size: meta.size, type: meta.type, ts: prev?.ts || Date.now(), blob })
  } catch { /* ignore */ }
}

// Drop the blob on unsave (keeps metadata).
export async function mhSetBlob(id: string, blob: Blob | null): Promise<void> {
  if (blob && blob.size > MH_MAX_BYTES) return
  try {
    const prev = await mhGet(id); if (!prev) return
    const db = await openDB()
    store(db, 'readwrite').put({ ...prev, blob: blob || undefined })
  } catch { /* ignore */ }
}

export async function mhDelete(id: string): Promise<void> {
  try { store(await openDB(), 'readwrite').delete(id) } catch { /* ignore */ }
}

export async function mhClear(): Promise<void> {
  autoFull = false
  try { store(await openDB(), 'readwrite').clear() } catch { /* ignore */ }
}

// Total cached-audio bytes (Blob.size is metadata — no bytes are read). `exclude` skips those ids.
export async function cachedBytes(exclude?: Set<string>): Promise<number> {
  try { const all = await mhList(); return all.reduce((s, it) => s + (it.blob && !(exclude && exclude.has(it.id)) ? (it.size || it.blob.size || 0) : 0), 0) } catch { return 0 }
}

// ---- Auto-cache: keep the audio blob for every added/played track so the whole list replays after a
// refresh. Bounded by the browser's quota (QuotaExceededError → stop, keep metadata) AND, when set, a
// user-chosen total cap in bytes (`cap`, 0 = unlimited). Over the cap → keep metadata only.
export async function mhAutoSave(meta: { id: string; name: string; size: number; type: string }, blob: Blob, cap = 0): Promise<void> {
  if (blob.size > MH_AUTOSAVE_PERFILE || autoFull) { await mhPutMeta(meta); return }
  if (cap > 0 && (await cachedBytes(new Set([meta.id]))) + blob.size > cap) { await mhPutMeta(meta); return } // over the user cap
  try {
    const db = await openDB()
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({ id: meta.id, name: meta.name, size: meta.size, type: meta.type, ts: Date.now(), blob })
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error)
    })
  } catch (e) { if ((e as { name?: string })?.name === 'QuotaExceededError') autoFull = true; try { await mhPutMeta(meta) } catch { /* ignore */ } }
}

// Batch auto-cache (e.g. a whole folder). Small chunks per transaction so a quota error only loses one
// chunk (partial success is kept) and no single transaction gets huge. Stops at the user cap too.
export async function mhAutoSaveMany(files: File[], cap = 0): Promise<void> {
  if (autoFull) return
  const batch = new Set(files.map((f) => f.name + '|' + f.size))
  let total = cap > 0 ? await cachedBytes(batch) : 0 // existing cached bytes, excluding this batch
  const CHUNK = 4
  for (let i = 0; i < files.length; i += CHUNK) {
    if (autoFull) break
    const chunk: File[] = []
    for (const f of files.slice(i, i + CHUNK)) {
      if (f.size > MH_AUTOSAVE_PERFILE) continue
      if (cap > 0 && total + f.size > cap) continue // over the user cap → leave metadata only
      chunk.push(f); total += f.size
    }
    if (!chunk.length) continue
    try {
      const db = await openDB()
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite'); const st = tx.objectStore(STORE); const base = Date.now()
        chunk.forEach((f, k) => st.put({ id: f.name + '|' + f.size, name: f.name, size: f.size, type: f.type, ts: base - i - k, blob: f }))
        tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error)
      })
    } catch (e) { if ((e as { name?: string })?.name === 'QuotaExceededError') autoFull = true; break }
  }
}

// Drop every cached audio blob but KEEP the metadata — the list stays (rows dimmed), space is freed.
export async function mhDropBlobs(): Promise<void> {
  autoFull = false
  try {
    const all = await mhList()
    const st = store(await openDB(), 'readwrite')
    for (const it of all) if (it.blob) st.put({ id: it.id, name: it.name, size: it.size, type: it.type, ts: it.ts })
  } catch { /* ignore */ }
}

// Cached-audio usage for the settings readout. We sum the ACTUAL cached blob bytes (Blob.size is
// metadata — no bytes are read) instead of navigator.storage.estimate().usage, which under-reports
// IndexedDB badly (e.g. 0.4 MB reported for 10 MB of blobs) and so barely moved when the cache was
// cleared. quota still comes from estimate().
export async function mhStorageUsage(): Promise<{ usage: number; quota: number }> {
  try {
    const usage = await cachedBytes()
    const nav = navigator as unknown as { storage?: { estimate?: () => Promise<{ quota?: number }> } }
    const e = await nav.storage?.estimate?.()
    return { usage, quota: e?.quota || 0 }
  } catch { return { usage: 0, quota: 0 } }
}
