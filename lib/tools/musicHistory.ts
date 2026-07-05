// Playlist persistence for the Music Player — same hybrid model as the video player, but its
// OWN IndexedDB so music tracks and video clips never mix:
//   • metadata (name/size/type) is kept for EVERY recent track, so the list survives a refresh.
//   • the actual audio BLOB is kept ONLY for 보관(starred) tracks, so only those replay in one click.
// All ops fail soft — if IndexedDB is unavailable/quota-full, the in-memory session list still works.

const DB_NAME = 'toolboxy-music'
const STORE = 'history'
const DB_VERSION = 1

export const MH_MAX_BYTES = 200 * 1024 * 1024 // per-file cap for a stored blob (200 MB)
export const MH_MAX_ITEMS = 200               // metadata is tiny, so keep plenty (favorites are never evicted)

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
  try { store(await openDB(), 'readwrite').clear() } catch { /* ignore */ }
}
