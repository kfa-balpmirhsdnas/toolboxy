'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('flashcards')!
const LS_KEY = 'fc_decks_v1'

type Card = { f: string; b: string }
type Deck = { id: number; name: string; cards: Card[] }
type View = { kind: 'list' } | { kind: 'edit'; id: number } | { kind: 'study'; id: number }

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardsPage() {
  const t = useTranslations('toolui')
  const [decks, setDecks] = useState<Deck[]>([])
  const [view, setView] = useState<View>({ kind: 'list' })
  const [newName, setNewName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Bulk-paste state (edit view)
  const [bulk, setBulk] = useState('')
  const [delim, setDelim] = useState<'tab' | 'comma'>('tab') // tab default — card text may contain commas

  // Study state
  const [queue, setQueue] = useState<number[]>([])   // card indexes to study
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [unknown, setUnknown] = useState<number[]>([])
  const [knownCount, setKnownCount] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setDecks(JSON.parse(raw))
    } catch { /* corrupted — start fresh */ }
  }, [])

  function persist(next: Deck[]) {
    setDecks(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* quota */ }
  }

  const deck = view.kind !== 'list' ? decks.find(d => d.id === view.id) : undefined

  // ----- deck CRUD -----
  function addDeck() {
    if (!newName.trim()) return
    const d: Deck = { id: Date.now(), name: newName.trim(), cards: [] }
    persist([...decks, d])
    setNewName('')
    setView({ kind: 'edit', id: d.id })
  }
  function removeDeck(id: number) { persist(decks.filter(d => d.id !== id)) }
  function updateDeck(id: number, fn: (d: Deck) => Deck) { persist(decks.map(d => d.id === id ? fn(d) : d)) }

  // ----- edit -----
  function setCard(i: number, side: 'f' | 'b', v: string) {
    if (!deck) return
    updateDeck(deck.id, d => ({ ...d, cards: d.cards.map((c, j) => j === i ? { ...c, [side]: v } : c) }))
  }
  function addCard() { if (deck) updateDeck(deck.id, d => ({ ...d, cards: [...d.cards, { f: '', b: '' }] })) }
  function removeCard(i: number) { if (deck) updateDeck(deck.id, d => ({ ...d, cards: d.cards.filter((_, j) => j !== i) })) }
  function importBulk() {
    if (!deck || !bulk.trim()) return
    const sep = delim === 'tab' ? '\t' : ','
    const cards: Card[] = bulk.split(/\r?\n/)
      .map(l => l.trim()).filter(Boolean)
      .map(l => {
        const i = l.indexOf(sep)
        return i < 0 ? { f: l, b: '' } : { f: l.slice(0, i).trim(), b: l.slice(i + 1).trim() }
      })
    updateDeck(deck.id, d => ({ ...d, cards: [...d.cards, ...cards] }))
    setBulk('')
  }

  // ----- study -----
  function startStudy(id: number, indexes?: number[]) {
    const d = decks.find(x => x.id === id)
    if (!d || d.cards.length === 0) return
    setQueue(shuffled(indexes ?? d.cards.map((_, i) => i)))
    setPos(0); setFlipped(false); setUnknown([]); setKnownCount(0)
    setView({ kind: 'study', id })
  }
  function answer(know: boolean) {
    if (!flipped) return
    if (know) setKnownCount(k => k + 1)
    else setUnknown(u => [...u, queue[pos]])
    setFlipped(false)
    setPos(p => p + 1)
  }

  // ----- export / import -----
  function exportJson() {
    const blob = new Blob([JSON.stringify(decks, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'flashcards.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function importJson(f: File) {
    f.text().then(txt => {
      try {
        const arr = JSON.parse(txt)
        if (!Array.isArray(arr)) throw new Error()
        const clean: Deck[] = arr
          .filter(d => d && typeof d.name === 'string' && Array.isArray(d.cards))
          .map((d, i) => ({ id: Date.now() + i, name: d.name, cards: d.cards.filter((c: Card) => c && typeof c.f === 'string').map((c: Card) => ({ f: c.f, b: c.b ?? '' })) }))
        persist([...decks, ...clean])
      } catch { alert(t('fc_import_err')) }
    })
  }

  const btn = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
  const outlineBtn = btn + ' bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('fc_title')}</h1>
        <p className="text-gray-500 mb-8">{t('fc_subtitle')}</p>

        {view.kind === 'list' && (
          <>
            <div className="flex gap-2 mb-4">
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDeck()}
                placeholder={t('fc_deck_ph')} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0" />
              <button onClick={addDeck} className={btn + ' bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4'}>{t('fc_new_deck')}</button>
            </div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 flex justify-between">
                <span>{t('fc_col_deck')}</span><span>{t('fc_col_cards')}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {decks.map(d => (
                  <div key={d.id} className="px-4 py-3 flex items-center gap-3">
                    <button onClick={() => startStudy(d.id)} disabled={d.cards.length === 0}
                      className="flex-1 text-left font-medium text-gray-900 truncate disabled:text-gray-400">{d.name}</button>
                    <span className="text-sm text-gray-500 tabular-nums">{d.cards.length}</span>
                    <button onClick={() => startStudy(d.id)} disabled={d.cards.length === 0} className={outlineBtn + ' disabled:opacity-40'}>{t('fc_study')}</button>
                    <button onClick={() => setView({ kind: 'edit', id: d.id })} className={outlineBtn}>{t('fc_edit')}</button>
                    <button onClick={() => removeDeck(d.id)} className="text-gray-300 hover:text-red-500">×</button>
                  </div>
                ))}
                {decks.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-400">{t('fc_empty')}</p>}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={exportJson} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_export')}</button>
              <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">{t('exd_import')}</button>
            </div>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
            <p className="mt-4 text-[11px] text-gray-400">{t('exd_local_note')}</p>
          </>
        )}

        {view.kind === 'edit' && deck && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setView({ kind: 'list' })} className={outlineBtn}>← {t('fc_back')}</button>
              <input value={deck.name} onChange={e => updateDeck(deck.id, d => ({ ...d, name: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none min-w-0" />
              <button onClick={() => startStudy(deck.id)} disabled={deck.cards.length === 0} className={btn + ' bg-brand-500 hover:bg-brand-600 text-white font-semibold disabled:opacity-40'}>{t('fc_study')}</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-gray-500 px-1">
                <span>{t('fc_front')}</span><span>{t('fc_back_side')}</span><span />
              </div>
              {deck.cards.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input value={c.f} onChange={e => setCard(i, 'f', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none min-w-0" />
                  <input value={c.b} onChange={e => setCard(i, 'b', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none min-w-0" />
                  <button onClick={() => removeCard(i)} className="text-gray-400 hover:text-red-500">×</button>
                </div>
              ))}
              <button onClick={addCard} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{t('fc_add_card')}</button>
            </div>
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">{t('fc_bulk')}</p>
              <p className="text-xs text-gray-400 mb-2">{t('fc_bulk_hint')}</p>
              <textarea value={bulk} onChange={e => setBulk(e.target.value)} rows={4}
                placeholder={delim === 'tab' ? t('fc_bulk_ph_tab') : t('fc_bulk_ph_comma')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex items-center gap-2 mt-2">
                <select value={delim} onChange={e => setDelim(e.target.value as 'tab' | 'comma')} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                  <option value="tab">{t('fc_delim_tab')}</option>
                  <option value="comma">{t('fc_delim_comma')}</option>
                </select>
                <button onClick={importBulk} className={btn + ' bg-gray-800 hover:bg-gray-700 text-white'}>{t('fc_bulk_add')}</button>
              </div>
            </div>
          </>
        )}

        {view.kind === 'study' && deck && (
          pos < queue.length ? (
            <>
              <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                <button onClick={() => setView({ kind: 'list' })} className={outlineBtn}>← {t('fc_quit')}</button>
                <span className="tabular-nums">{pos + 1} / {queue.length}</span>
              </div>
              <div style={{ perspective: '1000px' }} className="mb-4">
                <button onClick={() => setFlipped(f => !f)} aria-label={t('fc_flip')}
                  className="relative w-full h-64 select-none"
                  style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-brand-200 bg-white shadow-sm px-6 text-2xl font-bold text-gray-900 text-center"
                    style={{ backfaceVisibility: 'hidden' }}>{deck.cards[queue[pos]]?.f}</span>
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-brand-400 bg-brand-50 shadow-sm px-6 text-2xl font-bold text-brand-800 text-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{deck.cards[queue[pos]]?.b}</span>
                </button>
              </div>
              {flipped ? (
                <div className="flex gap-3 justify-center">
                  <button onClick={() => answer(false)} className="flex-1 max-w-40 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold hover:bg-red-100">{t('fc_dontknow')}</button>
                  <button onClick={() => answer(true)} className="flex-1 max-w-40 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold hover:bg-green-100">{t('fc_know')}</button>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400">{t('fc_tap_hint')}</p>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg font-bold text-gray-900 mb-1">{t('fc_done')}</p>
              <p className="text-sm text-gray-500 mb-5">{t('fc_done_stats', { know: knownCount, dont: unknown.length })}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {unknown.length > 0 && (
                  <button onClick={() => startStudy(deck.id, unknown)} className={btn + ' bg-brand-500 hover:bg-brand-600 text-white font-semibold'}>{t('fc_retry_unknown', { n: unknown.length })}</button>
                )}
                <button onClick={() => startStudy(deck.id)} className={outlineBtn}>{t('fc_restart')}</button>
                <button onClick={() => setView({ kind: 'list' })} className={outlineBtn}>{t('fc_back')}</button>
              </div>
            </div>
          )
        )}
      </div>
    </ToolLayout>
  )
}
