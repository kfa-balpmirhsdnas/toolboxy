// Persistent play-history for the Video Player. Small/medium clips are stored as blobs in
// IndexedDB so they replay in one click after a page refresh; files above VH_MAX_BYTES are
// skipped (they stay session-only) so the user's disk never balloons with huge videos.
// Newest-first, capped to VH_MAX_ITEMS (oldest evicted). All ops fail soft — if IndexedDB is
// unavailable/quota-full, the in-memory session history still works.

const DB_NAME = 'toolboxy-video'
const STORE = 'history'
const DB_VERSION = 1

export const VH_MAX_BYTES = 200 * 1024 * 1024 // per-file cap for persistence (200 MB)
export const VH_MAX_ITEMS = 15

export type VHItem = { id: string; name: string; size: number; type: string; ts: number; blob: Blob }

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

// All persisted clips, newest first.
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

// Store a played clip (skips large files); then evict anything beyond the item cap.
export async function vhPut(item: VHItem): Promise<void> {
  if (item.size > VH_MAX_BYTES) return
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => { const r = store(db, 'readwrite').put(item); r.onsuccess = () => resolve(); r.onerror = () => resolve() })
    const all = await vhList()
    if (all.length > VH_MAX_ITEMS) {
      const st = store(await openDB(), 'readwrite')
      all.slice(VH_MAX_ITEMS).forEach((x) => st.delete(x.id))
    }
  } catch { /* quota full / disabled — session history still works */ }
}

export async function vhDelete(id: string): Promise<void> {
  try { store(await openDB(), 'readwrite').delete(id) } catch { /* ignore */ }
}

export async function vhClear(): Promise<void> {
  try { store(await openDB(), 'readwrite').clear() } catch { /* ignore */ }
}
