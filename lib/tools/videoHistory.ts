// Hybrid persistence for the Video Player play-list:
//   • metadata (name/size/type + a small thumbnail) is kept for EVERY recent clip, so the list
//     survives a page refresh with almost no disk use.
//   • the actual video BLOB is kept ONLY for 보관(starred) clips, so only those replay in one click.
// Non-starred clips show in the list after a refresh but need to be re-opened to play (no blob).
// All ops fail soft — if IndexedDB is unavailable/quota-full, the in-memory session history still works.

const DB_NAME = 'toolboxy-video'
const STORE = 'history'
const DB_VERSION = 1

export const VH_MAX_BYTES = 200 * 1024 * 1024 // per-file cap for a stored blob (200 MB)
export const VH_MAX_ITEMS = 100                // metadata is tiny, so keep plenty (favorites are never evicted)

export type VHItem = { id: string; name: string; size: number; type: string; ts: number; blob?: Blob; thumb?: string }

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

async function vhGet(id: string): Promise<VHItem | undefined> {
  try { const db = await openDB(); return await reqP(store(db, 'readonly').get(id)) as VHItem | undefined } catch { return undefined }
}

// All records, newest first.
export async function vhList(): Promise<VHItem[]> {
  try {
    const db = await openDB()
    return await new Promise<VHItem[]>((resolve) => {
      const items: VHItem[] = []
      const cur = store(db, 'readonly').openCursor()
      cur.onsuccess = () => { const c = cur.result; if (c) { items.push(c.value as VHItem); c.continue() } else resolve(items.sort((a, b) => b.ts - a.ts)) }
      cur.onerror = () => resolve([])
    })
  } catch { return [] }
}

// Evict oldest METADATA-ONLY records beyond the cap. Starred clips (with a blob) are never evicted.
async function evict(): Promise<void> {
  try {
    const all = await vhList()
    const metaOnly = all.filter((x) => !x.blob)
    if (metaOnly.length > VH_MAX_ITEMS) {
      const st = store(await openDB(), 'readwrite')
      metaOnly.slice(VH_MAX_ITEMS).forEach((x) => st.delete(x.id))
    }
  } catch { /* ignore */ }
}

// Store/update a clip's metadata. Preserves any existing blob/thumb.
export async function vhPutMeta(meta: { id: string; name: string; size: number; type: string }): Promise<void> {
  try {
    const prev = await vhGet(meta.id)
    const db = await openDB()
    store(db, 'readwrite').put({ id: meta.id, name: meta.name, size: meta.size, type: meta.type, ts: Date.now(), blob: prev?.blob, thumb: prev?.thumb })
    await evict()
  } catch { /* ignore */ }
}

// Bulk-store metadata (e.g. when a folder is opened) in one transaction, preserving any existing
// blob/thumb, then evict once. Newest first — earlier items in `metas` get the higher timestamp.
export async function vhPutManyMeta(metas: { id: string; name: string; size: number; type: string }[]): Promise<void> {
  if (!metas.length) return
  try {
    const existing = await vhList()
    const byId = new Map(existing.map((x) => [x.id, x]))
    const db = await openDB()
    const st = store(db, 'readwrite')
    const base = Date.now()
    metas.forEach((m, i) => { const prev = byId.get(m.id); st.put({ id: m.id, name: m.name, size: m.size, type: m.type, ts: base - i, blob: prev?.blob, thumb: prev?.thumb }) })
    await new Promise<void>((res) => { st.transaction.oncomplete = () => res(); st.transaction.onerror = () => res(); st.transaction.onabort = () => res() })
    await evict()
  } catch { /* ignore */ }
}

// ★ Save: write the full record (metadata + blob) in one put — no dependency on prior metadata.
// Blobs above the cap are skipped (metadata is still stored so the clip stays in the list).
export async function vhSave(meta: { id: string; name: string; size: number; type: string }, blob: Blob): Promise<void> {
  if (blob.size > VH_MAX_BYTES) { await vhPutMeta(meta); return }
  try {
    const prev = await vhGet(meta.id)
    const db = await openDB()
    store(db, 'readwrite').put({ id: meta.id, name: meta.name, size: meta.size, type: meta.type, ts: prev?.ts || Date.now(), blob, thumb: prev?.thumb })
  } catch { /* ignore */ }
}

// Drop the blob on unsave (keeps metadata). Also used to set/clear a blob for an existing record.
export async function vhSetBlob(id: string, blob: Blob | null): Promise<void> {
  if (blob && blob.size > VH_MAX_BYTES) return
  try {
    const prev = await vhGet(id); if (!prev) return
    const db = await openDB()
    store(db, 'readwrite').put({ ...prev, blob: blob || undefined })
  } catch { /* ignore */ }
}

// Store a small thumbnail dataURL so the list keeps its preview after a refresh.
export async function vhSetThumb(id: string, thumb: string): Promise<void> {
  try {
    const prev = await vhGet(id); if (!prev || prev.thumb === thumb) return
    const db = await openDB()
    store(db, 'readwrite').put({ ...prev, thumb })
  } catch { /* ignore */ }
}

export async function vhDelete(id: string): Promise<void> {
  try { store(await openDB(), 'readwrite').delete(id) } catch { /* ignore */ }
}

export async function vhClear(): Promise<void> {
  try { store(await openDB(), 'readwrite').clear() } catch { /* ignore */ }
}
