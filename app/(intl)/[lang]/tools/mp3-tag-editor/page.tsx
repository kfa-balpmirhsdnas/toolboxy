'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { readId3Full, buildId3v23, writeMp3, EMPTY_FIELDS, type Id3Fields, type Id3Full } from '@/lib/tools/id3'
import { parseFileName, parseTrackNo, searchItunesSong, fetchArtBytes } from '@/lib/tools/songMeta'
import { quotedSplit } from '@/lib/tools/lyrics'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('mp3-tag-editor')!

// Common genres for the datalist — free text is always allowed on top of these.
const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Dance', 'Electronic', 'Jazz', 'Classical', 'Country', 'Folk', 'Blues', 'Metal', 'Punk', 'Reggae', 'Soul', 'Soundtrack', 'K-Pop', 'J-Pop', 'Ballad', 'Trot', 'Indie', 'Alternative', 'OST']

const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB')

// Filename auto-fill patterns. 'smart' runs the music player's shared parser (lib/tools/songMeta:
// junk-marker/track-number stripping, conservative "Artist - Title" split, quoted-title fallback);
// the fixed patterns remain for when the user knows the exact layout.
type NamePattern = 'smart' | 'tat' | 'at' | 'tt'
function parseByPattern(name: string, pat: NamePattern): Partial<Id3Fields> {
  const base = name.replace(/\.[^.]+$/, '').trim()
  if (pat === 'smart') {
    const out: Partial<Id3Fields> = {}
    const tr = parseTrackNo(base)
    if (tr) out.track = tr
    let pf: { artist: string; title: string } | null = parseFileName(base)
    if (!pf.artist) { const q = quotedSplit(base); if (q) pf = q } // 「가수들 '제목'」 filenames
    if (pf.title) out.title = pf.title
    if (pf.artist) out.artist = pf.artist
    return out
  }
  const parts = base.split(/\s*-\s*/)
  if (pat === 'tat' && parts.length >= 3 && /^\d{1,3}$/.test(parts[0])) return { track: String(parseInt(parts[0], 10)), artist: parts[1], title: parts.slice(2).join(' - ') }
  if (pat === 'at' && parts.length >= 2) return { artist: parts[0], title: parts.slice(1).join(' - ') }
  if (pat === 'tt') {
    const m = base.match(/^(\d{1,3})[\s.\-]+(.+)$/)
    if (m) return { track: String(parseInt(m[1], 10)), title: m[2] }
  }
  return {}
}

type Item = {
  id: string
  file: File
  parsed: Id3Full
  fields: Id3Fields
  cover: { data: Uint8Array; mime: string } | null
  coverUrl: string
  dirty: boolean
  err: boolean
}

export default function Mp3TagEditorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<Item[]>([])
  const [selId, setSelId] = useState('')
  const [advOpen, setAdvOpen] = useState(false)
  const [pattern, setPattern] = useState<NamePattern>('smart')
  const [artBusy, setArtBusy] = useState(false) // auto album-art lookup in progress
  const [renameOut, setRenameOut] = useState(false) // save as "아티스트 - 제목.mp3"
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef(items); itemsRef.current = items

  const sel = items.find((it) => it.id === selId) || null

  // Warn before leaving with unsaved edits; free cover object URLs on unmount.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => { if (itemsRef.current.some((it) => it.dirty)) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onLeave)
    return () => { window.removeEventListener('beforeunload', onLeave); itemsRef.current.forEach((it) => it.coverUrl && URL.revokeObjectURL(it.coverUrl)) }
  }, [])

  function patch(id: string, p: Partial<Item>) { setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it))) }
  function setField(key: keyof Id3Fields, v: string) { if (sel) patch(sel.id, { fields: { ...sel.fields, [key]: v }, dirty: true }) }

  async function addFiles(list: FileList | File[]) {
    const mp3s = Array.from(list).filter((f) => /\.mp3$/i.test(f.name) || f.type === 'audio/mpeg')
    if (!mp3s.length) { setNotice(t('mte_not_mp3')); return }
    setNotice('')
    trackToolUsed('mp3-tag-editor')
    const fresh: Item[] = []
    for (const f of mp3s) {
      const parsed = await readId3Full(f)
      const cover = parsed.cover
      fresh.push({
        id: f.name + '|' + f.size + '|' + Math.random().toString(36).slice(2, 8),
        file: f, parsed, fields: { ...parsed.fields }, cover,
        coverUrl: cover ? URL.createObjectURL(new Blob([cover.data as unknown as BlobPart], { type: cover.mime })) : '',
        dirty: false, err: false,
      })
    }
    setItems((prev) => [...prev, ...fresh])
    if (!selId && fresh.length) setSelId(fresh[0].id)
  }

  function removeItem(id: string) {
    setItems((prev) => { const it = prev.find((x) => x.id === id); if (it?.coverUrl) URL.revokeObjectURL(it.coverUrl); return prev.filter((x) => x.id !== id) })
    if (selId === id) setSelId('')
  }

  // ---- Album art ----
  async function replaceCover(f: File) {
    if (!sel) return
    if (!/^image\/(jpeg|png)$/.test(f.type)) { setNotice(t('mte_art_format')); return }
    setNotice('')
    const data = new Uint8Array(await f.arrayBuffer())
    if (sel.coverUrl) URL.revokeObjectURL(sel.coverUrl)
    patch(sel.id, { cover: { data, mime: f.type }, coverUrl: URL.createObjectURL(f), dirty: true })
  }
  function removeCover() {
    if (!sel) return
    if (sel.coverUrl) URL.revokeObjectURL(sel.coverUrl)
    patch(sel.id, { cover: null, coverUrl: '', dirty: true })
  }

  // ---- Batch ----
  // Apply the selected file's album/albumArtist/year/genre/cover to every file (album-cleanup flow).
  function applyToAll() {
    if (!sel) return
    setItems((prev) => prev.map((it) => {
      if (it.id === sel.id) return it
      if (it.coverUrl && it.coverUrl !== sel.coverUrl) URL.revokeObjectURL(it.coverUrl)
      return {
        ...it,
        fields: { ...it.fields, album: sel.fields.album, albumArtist: sel.fields.albumArtist, year: sel.fields.year, genre: sel.fields.genre },
        cover: sel.cover, coverUrl: sel.cover ? URL.createObjectURL(new Blob([sel.cover.data as unknown as BlobPart], { type: sel.cover.mime })) : '',
        dirty: true,
      }
    }))
    setNotice(t('mte_applied_all'))
  }
  async function fillFromNames() {
    if (artBusy) return
    // 1) fields from the filename (shared music-player parser or a fixed pattern)
    const updates = new Map<string, Partial<Id3Fields>>()
    for (const it of itemsRef.current) {
      const got = parseByPattern(it.file.name, pattern)
      if (Object.keys(got).length) updates.set(it.id, got)
    }
    if (updates.size) setItems((prev) => prev.map((it) => (updates.has(it.id) ? { ...it, fields: { ...it.fields, ...updates.get(it.id)! }, dirty: true } : it)))
    // 2) auto album art via the music player's iTunes module — only files still without a cover,
    //    queried with the just-filled artist+title (embedded art is never overwritten).
    setArtBusy(true); setNotice(t('mte_art_searching'))
    let added = 0
    try {
      for (const it of itemsRef.current) {
        if (it.cover) continue
        const f = { ...it.fields, ...(updates.get(it.id) || {}) }
        const term = ((f.artist || '') + ' ' + (f.title || it.file.name.replace(/\.[^.]+$/, ''))).trim()
        const hit = await searchItunesSong(term)
        if (!hit || !hit.artUrl) continue
        const art = await fetchArtBytes(hit.artUrl)
        if (!art) continue
        patch(it.id, { cover: art, coverUrl: URL.createObjectURL(new Blob([art.data as unknown as BlobPart], { type: art.mime })), dirty: true })
        added++
      }
    } finally {
      setArtBusy(false)
      setNotice(added ? t('mte_art_found', { n: added }) : '')
    }
  }

  // ---- Save ----
  function outBlob(it: Item, strip = false): Blob {
    const tag = strip ? null : buildId3v23(it.fields, it.cover, it.parsed.raw)
    return writeMp3(it.file, tag, it.parsed)
  }
  function outName(it: Item): string {
    if (renameOut && it.fields.title.trim()) {
      const a = it.fields.artist.trim()
      return ((a ? a + ' - ' : '') + it.fields.title.trim()).replace(/[\\/:*?"<>|]/g, '') + '.mp3'
    }
    return it.file.name.replace(/\.[^.]+$/, '') + '.mp3'
  }
  function download(it: Item, strip = false) {
    const url = URL.createObjectURL(outBlob(it, strip))
    const a = document.createElement('a')
    a.href = url; a.download = strip ? it.file.name.replace(/\.[^.]+$/, '') + '-notag.mp3' : outName(it); a.click()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    patch(it.id, { dirty: false })
    trackToolDownload('mp3-tag-editor', strip ? 'mp3-striptag' : 'mp3')
  }
  async function downloadZip() {
    const all = itemsRef.current
    if (all.length < 2) return
    const { zipSync } = await import('fflate')
    const entries: Record<string, Uint8Array> = {}
    for (const it of all) {
      let n = outName(it); let k = 1
      while (entries[n]) n = outName(it).replace(/\.mp3$/i, '') + ' (' + k++ + ').mp3'
      entries[n] = new Uint8Array(await outBlob(it).arrayBuffer())
    }
    const blob = new Blob([zipSync(entries) as unknown as BlobPart], { type: 'application/zip' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'mp3-tagged.zip'; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 30000)
    setItems((prev) => prev.map((it) => ({ ...it, dirty: false })))
    trackToolDownload('mp3-tag-editor', 'zip')
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400'
  const labelCls = 'block text-xs text-gray-500 mb-1'
  // Plain helper (NOT a component — a nested component type would remount and drop focus per keystroke).
  const field = (k: keyof Id3Fields, label: string, opts?: { placeholder?: string; wide?: boolean }) => (
    <div key={k} className={opts?.wide ? 'col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      <input value={sel ? sel.fields[k] : ''} onChange={(e) => setField(k, e.target.value)} placeholder={opts?.placeholder} className={inputCls} />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {/* Drop zone — stays available for adding more files */}
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
          className={'border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors ' + (items.length ? 'p-4' : 'p-8')}>
          <input ref={inputRef} type="file" accept=".mp3,audio/mpeg" multiple className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = '' }} onClick={(e) => e.stopPropagation()} />
          {!items.length && <p className="text-4xl mb-2">🎵🏷️</p>}
          <p className="text-sm font-medium text-gray-600">{t('mte_drop')}</p>
          {!items.length && (
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          )}
        </div>

        {notice && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">{notice}</p>}

        {items.length > 0 && (
          <div className="md:grid md:grid-cols-[280px,1fr] md:items-start gap-4 space-y-4 md:space-y-0">
            {/* File list (standard list style) + batch tools */}
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 text-xs text-gray-500">
                  <span>{t('mte_count', { n: items.length })}</span>
                  <span>{fmtBytes(items.reduce((s, it) => s + it.file.size, 0))}</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-auto">
                  {items.map((it) => (
                    <div key={it.id} onClick={() => setSelId(it.id)}
                      className={'flex items-center gap-2 px-3 py-2 cursor-pointer ' + (it.id === selId ? 'bg-brand-50' : 'hover:bg-gray-50')}>
                      <div className="w-9 h-9 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                        {it.coverUrl ? <img src={it.coverUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">🎵</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate">{it.fields.title || it.file.name.replace(/\.[^.]+$/, '')}</p>
                        <p className="text-xs text-gray-400 truncate">{it.fields.artist || fmtBytes(it.file.size)}{it.dirty && <span className="ml-1 text-brand-600 font-semibold">● {t('mte_modified')}</span>}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeItem(it.id) }} className="shrink-0 p-1 text-gray-400 hover:text-red-500" aria-label="remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch: filename auto-fill + ZIP */}
              <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                <label className={labelCls}>{t('mte_fill_from_name')}</label>
                <div className="flex gap-2">
                  <select value={pattern} onChange={(e) => setPattern(e.target.value as NamePattern)} className="flex-1 min-w-0 px-2 py-2 rounded-xl border border-gray-200 text-sm bg-white">
                    <option value="smart">{t('mte_pat_smart')}</option>
                    <option value="tat">01 - {t('mpl_artist')} - {t('mpl_title')}</option>
                    <option value="at">{t('mpl_artist')} - {t('mpl_title')}</option>
                    <option value="tt">01 - {t('mpl_title')}</option>
                  </select>
                  <button onClick={fillFromNames} disabled={artBusy} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-40">{artBusy ? '…' : t('mte_apply')}</button>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <input type="checkbox" checked={renameOut} onChange={(e) => setRenameOut(e.target.checked)} className="rounded" />
                  {t('mte_rename_rule')}
                </label>
                {items.length >= 2 && (
                  <button onClick={downloadZip} className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('mte_zip')}</button>
                )}
              </div>
            </div>

            {/* Edit form */}
            {sel ? (
              <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                {/* Album art — front and center */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-40 h-40 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 shadow-inner">
                    {sel.coverUrl ? <img src={sel.coverUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-5xl">🎵</span>}
                  </div>
                  <div className="flex gap-2">
                    <input ref={coverRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ''; if (f) replaceCover(f) }} />
                    <button onClick={() => coverRef.current?.click()} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">{sel.coverUrl ? t('mte_art_replace') : t('mte_art_add')}</button>
                    {sel.coverUrl && <button onClick={removeCover} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100">{t('mte_art_remove')}</button>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {field('title', t('mpl_title'), { wide: true })}
                  {field('artist', t('mpl_artist'), { wide: true })}
                  {field('album', t('mte_album'))}
                  {field('albumArtist', t('mte_album_artist'))}
                  {field('year', t('mte_year'), { placeholder: '2026' })}
                  <div>
                    <label className={labelCls}>{t('mte_genre')}</label>
                    <input list="mte-genres" value={sel.fields.genre} onChange={(e) => setField('genre', e.target.value)} className={inputCls} />
                    <datalist id="mte-genres">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
                  </div>
                  {field('track', t('mte_track'), { placeholder: '3/12' })}
                  {field('disc', t('mte_disc'), { placeholder: '1/1' })}
                  {field('comment', t('mte_comment'), { wide: true })}
                </div>

                {/* Advanced fields */}
                <div className="border-t border-gray-100 pt-2">
                  <button onClick={() => setAdvOpen((v) => !v)} className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 py-1">
                    <span>{t('mte_adv')}</span><span className={'transition-transform ' + (advOpen ? 'rotate-180' : '')}>▾</span>
                  </button>
                  {advOpen && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {field('composer', t('mte_composer'))}
                      {field('bpm', 'BPM')}
                      {field('copyright', t('mte_copyright'), { wide: true })}
                      <div className="col-span-2">
                        <label className={labelCls}>{t('mte_lyrics')}</label>
                        <textarea value={sel.fields.lyrics} onChange={(e) => setField('lyrics', e.target.value)} rows={5} className={inputCls + ' resize-y'} />
                      </div>
                      <button onClick={() => download(sel, true)} className="col-span-2 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100">{t('mte_strip')}</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => download(sel)} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('mte_save')}</button>
                  {items.length >= 2 && (
                    <button onClick={applyToAll} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200" title={t('mte_apply_all_hint')}>{t('mte_apply_all')}</button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{t('mte_apply_all_hint')} · {t('mte_v23_note')}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">{t('mte_pick_one')}</div>
            )}
          </div>
        )}

        {/* Privacy banner */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('md_note_local')}</span>
        </div>

        {/* Related tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {([['music-player', '🎧', t('mte_rel_player')], ['mp4-to-mp3', '🎬', t('mte_rel_mp4')], ['audio-converter', '🎵', t('vtm_rel_convert')]] as const).map(([slug, icon, label]) => (
            <a key={slug} href={`/${params.lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
