// Per-character index over the 천자문 (1000 unique characters) — powers the
// longtail 한자 pages (/tools/cheonjamun/[hanja]). Derived from cheonjamun.ts only.
import { CHEONJAMUN, type ClassicChar } from './cheonjamun'

export interface HanjaEntry extends ClassicChar { verseNo: number; idx: number }

export const HANJA_LIST: HanjaEntry[] = []
CHEONJAMUN.forEach((v) => {
  v.chars.forEach((c) => { HANJA_LIST.push({ ...c, verseNo: v.no, idx: HANJA_LIST.length }) })
})

export const HANJA_BY_CHAR: Record<string, HanjaEntry> = {}
for (const h of HANJA_LIST) if (!HANJA_BY_CHAR[h.hanja]) HANJA_BY_CHAR[h.hanja] = h
