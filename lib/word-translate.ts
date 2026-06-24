import { KR_JA } from './kr-ja-dict'
import { KR_EN } from './kr-en-dict'

export type Lang = 'ko' | 'ja' | 'en'

// Strip disambiguating parentheticals from Korean keys, e.g. '가지(나무)' -> '가지'.
function cleanKo(s: string): string {
  return s.replace(/\(.*?\)/g, '').trim()
}

/**
 * Build a lookup dictionary for any direction (ko/ja/en) by joining the shared
 * Korean keys of KR_JA and KR_EN. Japanese values that bundle multiple meanings
 * with '・' become separate lookup keys; English keys are lowercased.
 */
export function buildDict(from: Lang, to: Lang): Record<string, string> {
  const map: Record<string, string> = {}
  for (const koRaw of Object.keys(KR_JA)) {
    const vals: Record<Lang, string | undefined> = {
      ko: cleanKo(koRaw),
      ja: KR_JA[koRaw],
      en: KR_EN[koRaw],
    }
    const fromVal = vals[from]
    const toVal = vals[to]
    if (!fromVal || !toVal) continue

    const keys =
      from === 'ja' ? fromVal.split('・').map((x) => x.trim())
      : from === 'en' ? [fromVal.toLowerCase()]
      : [fromVal]

    for (const k of keys) {
      if (k && !(k in map)) map[k] = toVal
    }
  }
  return map
}

/** Normalize a user query for lookup in the given source language. */
export function normalize(input: string, from: Lang): string {
  const t = input.trim()
  return from === 'en' ? t.toLowerCase() : t.replace(/\s+/g, '')
}

export const TTS_LANG: Record<Lang, string> = { ko: 'ko-KR', ja: 'ja-JP', en: 'en-US' }
